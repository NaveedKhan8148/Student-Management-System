import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, message, Card, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const Parents = () => {
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [linkedStudentsMap, setLinkedStudentsMap] = useState({}); // { parentId: count }
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [editingParent, setEditingParent] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();
    const [linkForm] = Form.useForm();

    useEffect(() => {
        fetchParents();
        fetchStudents();
    }, []);

    const fetchParents = async () => {
        setTableLoading(true);
        try {
            const res = await axios.get('/api/v1/parents/');
            const parentsData = res.data.data;
            setParents(parentsData);
            // After fetching parents, fetch linked students count for each
            fetchAllLinkedStudents(parentsData);
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to fetch parents');
        } finally {
            setTableLoading(false);
        }
    };

    // Fetch linked students for every parent in parallel
    const fetchAllLinkedStudents = async (parentsData) => {
        try {
            const results = await Promise.all(
                parentsData.map((parent) =>
                    axios
                        .get(`/api/v1/parents/${parent._id}/students`)
                        .then((res) => ({ id: parent._id, count: res.data.data.length }))
                        .catch(() => ({ id: parent._id, count: 0 })) // if fails, show 0
                )
            );
            // Build a map: { parentId: count }
            const map = {};
            results.forEach(({ id, count }) => {
                map[id] = count;
            });
            setLinkedStudentsMap(map);
        } catch (err) {
            console.error('Failed to fetch linked students', err);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/v1/students/');
            setStudents(res.data.data);
        } catch (err) {
            message.error('Failed to fetch students');
        }
    };

    const totalParents = parents.length;

    // ── Table columns ─────────────────────────────────────────────────────────
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value, record) =>
                String(record.name).toLowerCase().includes(value.toLowerCase()) ||
                String(record.userId?.email || '').toLowerCase().includes(value.toLowerCase()) ||
                String(record.cnicNo || '').toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'CNIC No',
            dataIndex: 'cnicNo',
            key: 'cnicNo',
        },
        {
            title: 'Email',
            key: 'email',
            render: (_, record) => record.userId?.email || '-',
        },
        {
            title: 'Contact Number',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
        },
        {
            title: 'Linked Students',
            key: 'linkedStudents',
            render: (_, record) => {
                const count = linkedStudentsMap[record._id];
                // Show loading dash while fetching, then actual count
                if (count === undefined) return <span style={{ color: '#aaa' }}>...</span>;
                return (
                    <Tag color={count > 0 ? 'blue' : 'default'}>
                        {count} {count === 1 ? 'Student' : 'Students'}
                    </Tag>
                );
            },
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Tag color={record.userId?.status === 'ACTIVE' ? 'green' : 'red'}>
                    {record.userId?.status || 'ACTIVE'}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<LinkOutlined />}
                        title="Link to Student"
                        onClick={() => handleOpenLinkModal(record)}
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record._id)}
                    />
                </Space>
            ),
        },
    ];

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleEdit = (record) => {
        setEditingParent(record);
        form.setFieldsValue({
            name: record.name,
            cnicNo: record.cnicNo,
            contactNumber: record.contactNumber,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this parent?',
            content: 'This will also delete the parent login account.',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`/api/v1/parents/${id}`);
                    message.success('Parent deleted successfully');
                    fetchParents();
                } catch (err) {
                    message.error(err.response?.data?.message || 'Failed to delete parent');
                }
            },
        });
    };

    const handleSave = async (values) => {
        setSubmitLoading(true);
        try {
            if (editingParent) {
                await axios.patch(`/api/v1/parents/${editingParent._id}`, {
                    name: values.name,
                    cnicNo: values.cnicNo,
                    contactNumber: values.contactNumber,
                });
                message.success('Parent updated successfully');
            } else {
                await axios.post('/api/v1/parents/', {
                    email: values.email,
                    password: values.password,
                    name: values.name,
                    cnicNo: values.cnicNo,
                    contactNumber: values.contactNumber,
                });
                message.success('Parent created successfully');
            }
            fetchParents();
            handleCancel();
        } catch (err) {
            message.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingParent(null);
        form.resetFields();
    };

    const handleOpenLinkModal = (record) => {
        linkForm.setFieldsValue({ parentId: record._id });
        setIsLinkModalVisible(true);
    };

    const handleLinkSave = async (values) => {
        setSubmitLoading(true);
        try {
            await axios.post('/api/v1/parents/link-student', {
                parentId: values.parentId,
                studentId: values.studentId,
                relationship: values.relationship,
            });
            message.success('Student linked to parent successfully');
            setIsLinkModalVisible(false);
            linkForm.resetFields();
            fetchParents(); // refresh to update linked count
        } catch (err) {
            message.error(err.response?.data?.message || 'Filed to link student');
        } finally {
            setSubmitLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div>
            {/* ── Stat Card ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12} lg={8}>
                    <Card hoverable className="hover-card" title="Total Parents" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>{totalParents}</div>
                    </Card>
                </Col>
            </Row>

            {/* ── Search + Add ── */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input
                    placeholder="Search by name, email or CNIC..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 320 }}
                />
                <Space>
                    <Button onClick={fetchParents}>Refresh</Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingParent(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        Add Parent
                    </Button>
                </Space>
            </div>

            {/* ── Table ── */}
            <Table
                columns={columns}
                dataSource={parents}
                rowKey="_id"
                loading={tableLoading}
            />

            {/* ── Add / Edit Modal ── */}
            <Modal
                title={editingParent ? 'Edit Parent' : 'Add New Parent'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleSave} form={form}>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter parent name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="cnicNo"
                        label="CNIC No"
                        rules={[
                            { required: true, message: 'Please enter CNIC number' },
                            {
                                pattern: /^\d{5}-\d{7}-\d{1}$/,
                                message: 'Format: XXXXX-XXXXXXX-X',
                            },
                        ]}
                    >
                        <Input placeholder="12345-6789012-3" />
                    </Form.Item>

                    {!editingParent && (
                        <>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter a valid email' },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[{ required: true, message: 'Please enter a password' }]}
                            >
                                <Input.Password placeholder="Temporary password" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item
                        name="contactNumber"
                        label="Contact Number"
                        rules={[{ required: true, message: 'Please enter contact number' }]}
                    >
                        <Input placeholder="0321-9876543" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={submitLoading}>
                            {editingParent ? 'Update Parent' : 'Add Parent'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── Link Student Modal ── */}
            <Modal
                title="Link Student to Parent"
                open={isLinkModalVisible}
                onCancel={() => {
                    setIsLinkModalVisible(false);
                    linkForm.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleLinkSave} form={linkForm}>
                    <Form.Item name="parentId" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="studentId"
                        label="Select Student"
                        rules={[{ required: true, message: 'Please select a student' }]}
                    >
                        <Select
                            placeholder="Select student"
                            showSearch
                            optionFilterProp="children"
                        >
                            {students.map((s) => (
                                <Option key={s._id} value={s._id}>
                                    {s.studentName} — {s.rollNo}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="relationship"
                        label="Relationship"
                        rules={[{ required: true, message: 'Please select relationship' }]}
                    >
                        <Select placeholder="Select relationship">
                            <Option value="Father">Father</Option>
                            <Option value="Mother">Mother</Option>
                            <Option value="Guardian">Guardian</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={submitLoading}>
                            Link Student
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Parents;