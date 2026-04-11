import React, { useState, useEffect } from 'react';
import {
    Table, Button, Input, Space, Tag, Modal, Form, Select,
    message, Card, Row, Col, Popconfirm
} from 'antd';
import {
    PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
    ReloadOutlined, BookOutlined, UserOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [editingClass, setEditingClass] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    const fetchClasses = async () => {
        setTableLoading(true);
        try {
            const res = await axios.get('/api/v1/classes/');
            setClasses(res.data.data);
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to fetch classes');
        } finally {
            setTableLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await axios.get('/api/v1/teachers/');
            setTeachers(res.data.data);
        } catch (err) {
            message.error('Failed to fetch teachers');
        }
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalClasses = classes.length;
    const totalTeachers = teachers.length;

    // ── Table columns ─────────────────────────────────────────────────────────
    const columns = [
        {
            title: 'Class Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value, record) =>
                String(record.name).toLowerCase().includes(value.toLowerCase()) ||
                String(record.classTeacherId?.name || '').toLowerCase().includes(value.toLowerCase()),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Class Teacher',
            key: 'classTeacher',
            render: (_, record) => {
                const teacher = record.classTeacherId;
                if (teacher?.name) {
                    return <Tag color="blue">{teacher.name}</Tag>;
                }
                return <Tag color="default">Not Assigned</Tag>;
            },
        },
        {
            title: 'Subject',
            key: 'subject',
            render: (_, record) => record.classTeacherId?.subject || '-',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Delete Class"
                        description="Are you sure you want to delete this class?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleEdit = (record) => {
        setEditingClass(record);
        form.setFieldsValue({
            name: record.name,
            classTeacherId: record.classTeacherId?._id,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/v1/classes/${id}`);
            message.success('Class deleted successfully');
            fetchClasses();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to delete class');
        }
    };

    const handleSave = async (values) => {
        setSubmitLoading(true);
        try {
            if (editingClass) {
                // ── UPDATE ────────────────────────────────────────────────────
                await axios.patch(`/api/v1/classes/${editingClass._id}`, {
                    name: values.name,
                    classTeacherId: values.classTeacherId,
                });
                message.success('Class updated successfully');
            } else {
                // ── CREATE ────────────────────────────────────────────────────
                await axios.post('/api/v1/classes/', {
                    name: values.name,
                    classTeacherId: values.classTeacherId,
                });
                message.success('Class created successfully');
            }
            fetchClasses();
            handleCancel();
        } catch (err) {
            message.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingClass(null);
        form.resetFields();
    };

    // ── Stats cards ───────────────────────────────────────────────────────────
    const statsCards = [
        { title: 'Total Classes',  value: totalClasses,  color: '#1890ff', icon: <BookOutlined /> },
        { title: 'Total Teachers', value: totalTeachers, color: '#faad14', icon: <UserOutlined /> },
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div>
            {/* ── Stat Cards ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {statsCards.map((card, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card hoverable style={{ borderTop: `4px solid ${card.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>
                                        {card.title}
                                    </div>
                                    <div style={{ fontSize: 30, fontWeight: 'bold', color: card.color }}>
                                        {card.value}
                                    </div>
                                </div>
                                <div style={{ fontSize: 40, color: card.color }}>
                                    {card.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* ── Search + Buttons ── */}
            <div style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
            }}>
                <Input
                    placeholder="Search by class name or teacher..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 320 }}
                    allowClear
                />
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchClasses}>
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingClass(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        Add Class
                    </Button>
                </Space>
            </div>

            {/* ── Table ── */}
            <Table
                columns={columns}
                dataSource={classes}
                rowKey="_id"
                loading={tableLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} classes`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                scroll={{ x: 600 }}
            />

            {/* ── Add / Edit Modal ── */}
            <Modal
                title={editingClass ? 'Edit Class' : 'Add New Class'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={500}
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleSave} form={form}>
                    <Form.Item
                        name="name"
                        label="Class Name"
                        rules={[{ required: true, message: 'Please enter class name' }]}
                    >
                        <Input placeholder="e.g. CS-101" />
                    </Form.Item>

                    <Form.Item
                        name="classTeacherId"
                        label="Class Teacher"
                        rules={[{ required: true, message: 'Please select a class teacher' }]}
                    >
                        <Select
                            placeholder="Select class teacher"
                            showSearch
                            optionFilterProp="children"
                            loading={teachers.length === 0}
                        >
                            {teachers.map((teacher) => (
                                <Option key={teacher._id} value={teacher._id}>
                                    {teacher.name} — {teacher.subject}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={submitLoading}
                            size="large"
                        >
                            {editingClass ? 'Update Class' : 'Create Class'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Classes;