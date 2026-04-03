import React, { useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, message, Card, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { teachersData } from '../data/teachers';

const { Option } = Select;

const Teachers = () => {
    const [teachers, setTeachers] = useState(teachersData);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [form] = Form.useForm();

    const totalTeachers = teachers.length;

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
                    String(record.department).toLowerCase().includes(value.toLowerCase())
                );
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: 'Programs',
            dataIndex: 'assignedPrograms',
            key: 'assignedPrograms',
            render: (programs) => (programs ? programs.join(', ') : '—'),
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
        setEditingTeacher(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (key) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this teacher?',
            onOk: () => {
                setTeachers(teachers.filter((t) => t.key !== key));
                message.success('Teacher deleted successfully');
            },
        });
    };

    const handleSave = (values) => {
        if (editingTeacher) {
            const updatedTeachers = teachers.map((t) =>
                t.key === editingTeacher.key ? { ...t, ...values } : t
            );
            setTeachers(updatedTeachers);
            message.success('Teacher updated successfully');
        } else {
            const newTeacher = {
                key: String(teachers.length + 1),
                id: `TCH00${teachers.length + 1}`,
                name: values.name,
                email: values.email,
                department: values.department,
                assignedPrograms: values.assignedPrograms,
                status: values.status || 'Active',
            };
            setTeachers([...teachers, newTeacher]);
            message.success('Teacher added successfully');
        }

        setIsModalVisible(false);
        setEditingTeacher(null);
        form.resetFields();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingTeacher(null);
        form.resetFields();
    };

    return (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12} lg={8}>
                    <Card hoverable className="hover-card" title="Total teachers" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>{totalTeachers}</div>
                    </Card>
                </Col>
            </Row>

            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input
                    placeholder="Search teachers..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingTeacher(null);
                        form.resetFields();
                        setIsModalVisible(true);
                    }}
                >
                    Add Teacher
                </Button>
            </div>

            <Table columns={columns} dataSource={teachers} />

            <Modal
                title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleSave} form={form}>
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter teacher name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="department"
                        label="Department"
                        rules={[{ required: true, message: 'Please select department' }]}
                    >
                        <Select>
                            <Option value="Mathematics">Mathematics</Option>
                            <Option value="Physics">Physics</Option>
                            <Option value="Engineering">Engineering</Option>
                            <Option value="Arts">Arts</Option>
                            <Option value="Economics">Economics</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="assignedPrograms"
                        label="Assigned Programs"
                        rules={[{ required: true, message: 'Please select at least one program' }]}
                    >
                        <Select mode="multiple" placeholder="Select programs">
                            <Option value="Computer Science">Computer Science</Option>
                            <Option value="Business Administration">Business Administration</Option>
                            <Option value="Engineering">Engineering</Option>
                            <Option value="Arts">Arts</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="status" label="Status" initialValue="Active">
                        <Select>
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Teachers;