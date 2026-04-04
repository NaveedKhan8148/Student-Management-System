import React, { useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, message, Card, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { parentsData } from '../data/parents';
import { studentsData } from '../data/students';

const { Option } = Select;

const Parents = () => {
    const [parents, setParents] = useState(parentsData);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [editingParent, setEditingParent] = useState(null);
    const [form] = Form.useForm();

    const totalParents = parents.length;

    // Get child name options from students data
    const childNameOptions = studentsData.map(student => ({
        value: student.studentName,
        label: student.studentName
    }));

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value, record) => {
                return (
                    String(record.name).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.id).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.email).toLowerCase().includes(value.toLowerCase())
                );
            },
        },
        {
            title: 'CNIC NO',
            dataIndex: 'cnicNo',
            key: 'cnicNo',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Contact Number',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
        },
        {
            title: 'Child Name',
            dataIndex: 'childName',
            key: 'childName',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.key)} />
                </Space>
            ),
        },
    ];

    const handleEdit = (record) => {
        setEditingParent(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (key) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this parent?',
            onOk: () => {
                setParents(parents.filter((p) => p.key !== key));
                message.success('Parent deleted successfully');
            },
        });
    };

    const handleSave = (values) => {
        if (editingParent) {
            const updatedParents = parents.map((p) =>
                p.key === editingParent.key
                    ? { ...p, ...values, password: values.password ?? p.password }
                    : p
            );
            setParents(updatedParents);
            message.success('Parent updated successfully');
        } else {
            const newParent = {
                key: String(parents.length + 1),
                id: `PAR00${parents.length + 1}`,
                name: values.name,
                cnicNo: values.cnicNo,
                email: values.email,
                contactNumber: values.contactNumber,
                childName: values.childName,
                password: values.password,
                role: values.role || 'parent',
                status: values.status || 'Active',
            };
            setParents([...parents, newParent]);
            message.success('Parent added successfully');
        }

        setIsModalVisible(false);
        setEditingParent(null);
        form.resetFields();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingParent(null);
        form.resetFields();
    };

    return (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12} lg={8}>
                    <Card hoverable className="hover-card" title="Total parents" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>{totalParents}</div>
                    </Card>
                </Col>
            </Row>

            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input
                    placeholder="Search parents..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
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
            </div>

            <Table columns={columns} dataSource={parents} />

            <Modal
                title={editingParent ? 'Edit Parent' : 'Add New Parent'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
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
                        label="CNIC NO"
                        rules={[
                            { required: true, message: 'Please enter CNIC number' },
                            { pattern: /^\d{5}-\d{7}-\d{1}$/, message: 'CNIC format should be XXXXX-XXXXXXX-X' }
                        ]}
                    >
                        <Input placeholder="12345-6789012-3" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={editingParent ? [] : [{ required: true, message: 'Please enter a password' }]}
                    >
                        <Input.Password placeholder="Enter login password" />
                    </Form.Item>
                    <Form.Item
                        name="contactNumber"
                        label="Contact Number"
                        rules={[{ required: true, message: 'Please enter contact number' }]}
                    >
                        <Input placeholder="+92-300-1234567" />
                    </Form.Item>
                    <Form.Item
                        name="childName"
                        label="Child Name"
                        rules={[{ required: true, message: 'Please select child name' }]}
                    >
                        <Select placeholder="Select child name">
                            {childNameOptions.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="status" label="Status" initialValue="Active">
                        <Select>
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Role"
                        initialValue="parent"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select>
                            <Option value="student">Student</Option>
                            <Option value="teacher">Teacher</Option>
                            <Option value="parent">Parent</Option>
                            <Option value="admin">Admin</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {editingParent ? 'Update Parent' : 'Add Parent'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Parents;