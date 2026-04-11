import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, message, Card, Row, Col, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { teacherService } from '../services/teacherService';

const { Option } = Select;

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [form] = Form.useForm();

    // Fetch teachers on component mount
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await teacherService.getAllTeachers();
            console.log('Teachers data received:', response);
            
            // Transform API response to match table structure
            const formattedTeachers = response.map((teacher) => ({
                key: teacher._id, // Use MongoDB _id as key
                id: teacher._id, // Use _id as ID
                name: teacher.name || '',
                contactNumber: teacher.contactNumber || '',
                email: teacher.userId?.email || '', // Get email from nested userId object
                subject: teacher.subject || '',
                dateOfJoining: teacher.dateOfJoining ? new Date(teacher.dateOfJoining).toLocaleDateString() : '',
                cnicNumber: teacher.cnicNumber || '',
                address: teacher.address || '',
                status: teacher.userId?.status || 'ACTIVE', // Get status from userId
                userId: teacher.userId, // Store full userId object for updates
                createdAt: teacher.createdAt,
                updatedAt: teacher.updatedAt,
            }));
            
            console.log('Formatted teachers:', formattedTeachers);
            setTeachers(formattedTeachers);
            
            if (formattedTeachers.length === 0) {
                message.info('No teachers found');
            } else {
                message.success(`${formattedTeachers.length} teachers loaded successfully`);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            message.error(error.message || 'Failed to fetch teachers');
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    };

    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'ACTIVE').length;

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 250,
            render: (id) => <span style={{ fontSize: '12px' }}>{id}</span>,
            sorter: (a, b) => String(a.id).localeCompare(String(b.id)),
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
                    String(record.email).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.subject).toLowerCase().includes(value.toLowerCase())
                );
            },
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Contact Number',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
            sorter: (a, b) => String(a.contactNumber).localeCompare(String(b.contactNumber)),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            sorter: (a, b) => a.subject.localeCompare(b.subject),
        },
        {
            title: 'Date of Joining',
            dataIndex: 'dateOfJoining',
            key: 'dateOfJoining',
            sorter: (a, b) => new Date(a.dateOfJoining) - new Date(b.dateOfJoining),
        },
        {
            title: 'CNIC Number',
            dataIndex: 'cnicNumber',
            key: 'cnicNumber',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status}</Tag>,
            filters: [
                { text: 'Active', value: 'ACTIVE' },
                { text: 'Inactive', value: 'INACTIVE' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)} 
                        type="link"
                    />
                    <Button 
                        icon={<DeleteOutlined />} 
                        danger 
                        onClick={() => handleDelete(record)} 
                        type="link"
                    />
                </Space>
            ),
        },
    ];

    const handleEdit = (record) => {
        setEditingTeacher(record);
        form.setFieldsValue({
            name: record.name,
            contactNumber: record.contactNumber,
            email: record.email,
            subject: record.subject,
            dateOfJoining: record.dateOfJoining,
            cnicNumber: record.cnicNumber,
            address: record.address,
            status: record.status,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this teacher?',
            content: `Teacher: ${record.name}`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    setLoading(true);
                    await teacherService.deleteTeacher(record.id);
                    message.success('Teacher deleted successfully');
                    fetchTeachers(); // Refresh the list
                } catch (error) {
                    console.error('Error deleting teacher:', error);
                    message.error(error.message || 'Failed to delete teacher');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

const handleSave = async (values) => {
    try {
        setLoading(true);
        
        // Prepare payload
        const payload = {
            name: values.name,
            contactNumber: values.contactNumber,
            email: values.email,
            subject: values.subject,
            dateOfJoining: values.dateOfJoining,
            cnicNumber: values.cnicNumber,
            address: values.address,
        };

        // Add password only if provided
        if (values.password && values.password.trim() !== '') {
            payload.password = values.password;
        }

        console.log('Payload being sent:', payload);

        if (editingTeacher) {
            // Clean up payload - remove undefined or null values for PATCH
            const cleanPayload = {};
            Object.keys(payload).forEach(key => {
                if (payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
                    cleanPayload[key] = payload[key];
                }
            });
            
            console.log('Sending PATCH request to update teacher:', editingTeacher.id);
            console.log('Clean payload:', cleanPayload);
            
            await teacherService.updateTeacher(editingTeacher.id, cleanPayload);
            message.success('Teacher updated successfully');
        } else {
            // New teacher requires password
            if (!payload.password) {
                message.error('Password is required for new teachers');
                setLoading(false);
                return;
            }
            
            console.log('Sending POST request to add teacher');
            await teacherService.addTeacher(payload);
            message.success('Teacher added successfully');
        }

        await fetchTeachers();
        setIsModalVisible(false);
        setEditingTeacher(null);
        form.resetFields();
        
    } catch (error) {
        console.error('Error in handleSave:', error);
        
        if (error.message === 'EMAIL_ALREADY_EXISTS' ||
            error.message?.toLowerCase().includes('email already exists')) {
            message.error('This email is already registered. Please use a different email address.');
        } else if (error.response?.status === 404) {
            message.error('Teacher not found. It may have been deleted.');
        } else {
            message.error(error.message || 'Failed to save teacher');
        }
    } finally {
        setLoading(false);
    }
};

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingTeacher(null);
        form.resetFields();
    };

    return (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable bordered>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Total Teachers</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#1890ff' }}>
                                {totalTeachers}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable bordered>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Active Teachers</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#52c41a' }}>
                                {activeTeachers}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable bordered>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Inactive Teachers</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#ff4d4f' }}>
                                {totalTeachers - activeTeachers}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <Input
                    placeholder="Search teachers by name, ID, email or subject..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchTeachers}
                        loading={loading}
                    >
                        Refresh
                    </Button>
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
                </Space>
            </div>

            <Spin spinning={loading}>
                <Table 
                    columns={columns} 
                    dataSource={teachers}
                    scroll={{ x: 1200 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} teachers`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    locale={{
                        emptyText: loading ? 'Loading...' : 'No teachers found',
                    }}
                />
            </Spin>

            <Modal
                title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    onFinish={handleSave}
                    form={form}
                    initialValues={{
                        status: 'ACTIVE',
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter teacher name' }]}
                    >
                        <Input placeholder="Enter full name" />
                    </Form.Item>

                    <Form.Item
                        name="contactNumber"
                        label="Contact Number"
                        rules={[
                            { required: true, message: 'Please enter contact number' },
                            { pattern: /^[\d\+\-\(\) ]+$/, message: 'Please enter a valid phone number' }
                        ]}
                    >
                        <Input placeholder="0300-1234567" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                        extra="This email will be used for login"
                    >
                        <Input placeholder="teacher@school.edu" />
                    </Form.Item>

                    {!editingTeacher && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please enter a password' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}
                            extra="Minimum 6 characters"
                        >
                            <Input.Password placeholder="Enter login password" />
                        </Form.Item>
                    )}

                    {editingTeacher && (
                        <Form.Item
                            name="password"
                            label="Password"
                            extra="Leave blank to keep current password"
                        >
                            <Input.Password placeholder="Enter new password (optional)" />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="subject"
                        label="Subject"
                        rules={[{ required: true, message: 'Please select subject' }]}
                    >
                        <Select placeholder="Select subject" showSearch>
                            <Option value="Mathematics">Mathematics</Option>
                            <Option value="Physics">Physics</Option>
                            <Option value="Chemistry">Chemistry</Option>
                            <Option value="Biology">Biology</Option>
                            <Option value="English">English</Option>
                            <Option value="Urdu">Urdu</Option>
                            <Option value="Computer Science">Computer Science</Option>
                            <Option value="Business Administration">Business Administration</Option>
                            <Option value="Engineering">Engineering</Option>
                            <Option value="Arts">Arts</Option>
                            <Option value="Economics">Economics</Option>
                            <Option value="History">History</Option>
                            <Option value="Geography">Geography</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dateOfJoining"
                        label="Date of Joining"
                        rules={[{ required: true, message: 'Please enter date of joining' }]}
                        extra="Format: YYYY-MM-DD"
                    >
                        <Input placeholder="2024-01-15" />
                    </Form.Item>

                    <Form.Item
                        name="cnicNumber"
                        label="CNIC Number"
                        rules={[
                            { required: true, message: 'Please enter CNIC number' },
                            { pattern: /^\d{5}-\d{7}-\d{1}$/, message: 'CNIC format should be XXXXX-XXXXXXX-X' }
                        ]}
                        extra="Format: 12345-6789012-3"
                    >
                        <Input placeholder="12345-6789012-3" />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Complete address" />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Teachers;