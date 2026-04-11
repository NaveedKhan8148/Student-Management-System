import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, message, Card, Row, Col, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { teacherService } from '../services/teacherService';
import { feesData } from '../data/fees';
import { attendanceData } from '../data/attendance';

const { Option } = Select;

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();

    // Fetch teachers on component mount
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await teacherService.getAllTeachers();
            
            // Transform API response to match table structure
            const formattedTeachers = response.map((teacher) => ({
                key: teacher._id,
                _id: teacher._id,
                name: teacher.name || '',
                contactNumber: teacher.contactNumber || '',
                email: teacher.userId?.email || '',
                subject: teacher.subject || '',
                dateOfJoining: teacher.dateOfJoining ? new Date(teacher.dateOfJoining).toLocaleDateString() : '',
                cnicNumber: teacher.cnicNumber || '',
                address: teacher.address || '',
                status: teacher.userId?.status || 'ACTIVE',
                userId: teacher.userId,
                createdAt: teacher.createdAt,
                updatedAt: teacher.updatedAt,
            }));
            
            setTeachers(formattedTeachers);
            
            if (formattedTeachers.length === 0) {
                message.info('No teachers found');
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            message.error(error.message || 'Failed to fetch teachers');
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'ACTIVE').length;
    const inactiveTeachers = totalTeachers - activeTeachers;

    // Static data for fees and attendance (same as students)
    const totalCollected = feesData
        .filter((item) => item.status === 'Paid')
        .reduce((sum, item) => sum + item.amount, 0);

    const totalPending = feesData
        .filter((item) => item.status === 'Pending')
        .reduce((sum, item) => sum + item.amount, 0);

    const totalPresent = attendanceData.filter((item) => item.status === 'Present').length;
    const totalAbsent = attendanceData.filter((item) => item.status === 'Absent').length;

    // Table columns
    const columns = [
        {
            title: 'Teacher Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value, record) =>
                String(record.name).toLowerCase().includes(value.toLowerCase()) ||
                String(record.email).toLowerCase().includes(value.toLowerCase()) ||
                String(record.subject).toLowerCase().includes(value.toLowerCase()) ||
                String(record.contactNumber).toLowerCase().includes(value.toLowerCase()),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Contact Number',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
            sorter: (a, b) => String(a.contactNumber).localeCompare(String(b.contactNumber)),
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            filters: [
                { text: 'Mathematics', value: 'Mathematics' },
                { text: 'Physics', value: 'Physics' },
                { text: 'Chemistry', value: 'Chemistry' },
                { text: 'Biology', value: 'Biology' },
                { text: 'English', value: 'English' },
                { text: 'Computer Science', value: 'Computer Science' },
            ],
            onFilter: (value, record) => record.subject === value,
            sorter: (a, b) => a.subject.localeCompare(b.subject),
        },
        {
            title: 'CNIC Number',
            dataIndex: 'cnicNumber',
            key: 'cnicNumber',
        },
        {
            title: 'Date of Joining',
            dataIndex: 'dateOfJoining',
            key: 'dateOfJoining',
            render: (date) => date || '-',
            sorter: (a, b) => {
                if (!a.dateOfJoining) return 1;
                if (!b.dateOfJoining) return -1;
                return new Date(a.dateOfJoining) - new Date(b.dateOfJoining);
            },
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Tag color={record.status === 'ACTIVE' ? 'green' : 'red'}>
                    {record.status}
                </Tag>
            ),
            filters: [
                { text: 'Active', value: 'ACTIVE' },
                { text: 'Inactive', value: 'INACTIVE' },
            ],
            onFilter: (value, record) => record.status === value,
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
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ];

    // Handlers
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
                    await teacherService.deleteTeacher(record._id);
                    message.success('Teacher deleted successfully');
                    fetchTeachers();
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
        setSubmitLoading(true);
        try {
            const payload = {
                name: values.name,
                contactNumber: values.contactNumber,
                email: values.email,
                subject: values.subject,
                dateOfJoining: values.dateOfJoining,
                cnicNumber: values.cnicNumber,
                address: values.address,
                status: values.status,
            };

            if (values.password && values.password.trim() !== '') {
                payload.password = values.password;
            }

            if (editingTeacher) {
                const cleanPayload = {};
                Object.keys(payload).forEach(key => {
                    if (payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
                        cleanPayload[key] = payload[key];
                    }
                });
                
                await teacherService.updateTeacher(editingTeacher._id, cleanPayload);
                message.success('Teacher updated successfully');
            } else {
                if (!payload.password) {
                    message.error('Password is required for new teachers');
                    setSubmitLoading(false);
                    return;
                }
                
                await teacherService.addTeacher(payload);
                message.success('Teacher added successfully');
            }

            await fetchTeachers();
            handleCancel();
        } catch (error) {
            console.error('Error in handleSave:', error);
            
            if (error.message === 'EMAIL_ALREADY_EXISTS' ||
                error.message?.toLowerCase().includes('email already exists')) {
                message.error('This email is already registered. Please use a different email address.');
            } else {
                message.error(error.message || 'Failed to save teacher');
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingTeacher(null);
        form.resetFields();
    };

    return (
        <div>
            {/* Stats Cards - Same design as Students */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable className="hover-card" title="Total Teachers" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#1890ff' }}>{totalTeachers}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable className="hover-card" title="Active Teachers" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>{activeTeachers}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable className="hover-card" title="Inactive Teachers" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f' }}>{inactiveTeachers}</div>
                    </Card>
                </Col>
            </Row>

            {/* Search and Add Button */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <Input
                    placeholder="Search by name, email, subject or contact..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 320 }}
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
                            form.setFieldsValue({ status: 'ACTIVE' });
                            setIsModalVisible(true);
                        }}
                    >
                        Add Teacher
                    </Button>
                </Space>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={teachers}
                rowKey="_id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} teachers`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                scroll={{ x: 1200 }}
            />

            {/* Add/Edit Modal */}
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
                        label="Teacher Name"
                        rules={[{ required: true, message: 'Please enter teacher name' }]}
                    >
                        <Input placeholder="e.g. Prof. John Smith" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' },
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
                        name="contactNumber"
                        label="Contact Number"
                        rules={[
                            { required: true, message: 'Please enter contact number' },
                        ]}
                    >
                        <Input placeholder="e.g. 0300-1234567" />
                    </Form.Item>

                    <Form.Item
                        name="subject"
                        label="Subject"
                        rules={[{ required: true, message: 'Please select subject' }]}
                    >
                        <Select 
                            placeholder="Select subject"
                            showSearch
                            optionFilterProp="children"
                        >
                            <Option value="Mathematics">Mathematics</Option>
                            <Option value="Physics">Physics</Option>
                            <Option value="Chemistry">Chemistry</Option>
                            <Option value="Biology">Biology</Option>
                            <Option value="English">English</Option>
                            <Option value="Urdu">Urdu</Option>
                            <Option value="Computer Science">Computer Science</Option>
                            <Option value="Business Administration">Business Administration</Option>
                            <Option value="Economics">Economics</Option>
                            <Option value="History">History</Option>
                            <Option value="Geography">Geography</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="cnicNumber"
                        label="CNIC Number"
                        rules={[
                            { required: true, message: 'Please enter CNIC number' },
                        ]}
                        extra="Format: 12345-6789012-3"
                    >
                        <Input placeholder="12345-6789012-3" />
                    </Form.Item>

                    <Form.Item
                        name="dateOfJoining"
                        label="Date of Joining"
                        rules={[{ required: true, message: 'Please enter date of joining' }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Complete address" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select placeholder="Select status">
                            <Option value="ACTIVE">
                                <Space>
                                    <Tag color="green">ACTIVE</Tag>
                                    <span>Active Teacher</span>
                                </Space>
                            </Option>
                            <Option value="INACTIVE">
                                <Space>
                                    <Tag color="red">INACTIVE</Tag>
                                    <span>Inactive Teacher</span>
                                </Space>
                            </Option>
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
                            {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Teachers;