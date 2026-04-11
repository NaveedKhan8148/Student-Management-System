import React, { useMemo, useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, message, Card, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { feesData } from '../data/fees';
import { attendanceData } from '../data/attendance';
import axios from 'axios';

const { Option } = Select;

const Students = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        setTableLoading(true);
        try {
            const res = await axios.get('/api/v1/students/');
            console.log('API Response:', res.data); // Debug log
            setStudents(res.data.data);
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to fetch students');
        } finally {
            setTableLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await axios.get('/api/v1/classes/');
            setClasses(res.data.data);
        } catch (err) {
            message.error('Failed to fetch classes');
        }
    };

    // ── Stats (fees & attendance still from static data until API is ready) ───
    const totalStudents = students.length;
    
    // FIXED: Check status from both student level and userId level
    const inactiveStudents = students.filter(
        (student) => student.status === 'INACTIVE' || student.userId?.status === 'INACTIVE'
    ).length;
    
    const activeStudents = students.filter(
        (student) => student.status === 'ACTIVE' || student.userId?.status === 'ACTIVE'
    ).length;

    const totalCollected = feesData
        .filter((item) => item.status === 'Paid')
        .reduce((sum, item) => sum + item.amount, 0);

    const totalPending = feesData
        .filter((item) => item.status === 'Pending')
        .reduce((sum, item) => sum + item.amount, 0);

    const totalPresent = attendanceData.filter((item) => item.status === 'Present').length;
    const totalAbsent = attendanceData.filter((item) => item.status === 'Absent').length;

    // ── Table columns ─────────────────────────────────────────────────────────
    const columns = [
        {
            title: 'Roll No',
            dataIndex: 'rollNo',
            key: 'rollNo',
            sorter: (a, b) => a.rollNo.localeCompare(b.rollNo),
        },
        {
            title: 'Student Name',
            dataIndex: 'studentName',
            key: 'studentName',
            filteredValue: [searchText],
            onFilter: (value, record) =>
                String(record.studentName).toLowerCase().includes(value.toLowerCase()) ||
                String(record.rollNo).toLowerCase().includes(value.toLowerCase()) ||
                String(record.userId?.email || '').toLowerCase().includes(value.toLowerCase()),
            sorter: (a, b) => a.studentName.localeCompare(b.studentName),
        },
        {
            title: 'Email',
            key: 'email',
            render: (_, record) => record.userId?.email || '-',
        },
        {
            title: 'Class',
            key: 'class',
            render: (_, record) => record.classId?.name || '-',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            render: (address) => address || '-',
        },
        {
            title: 'Date of Joining',
            dataIndex: 'dateOfJoining',
            key: 'dateOfJoining',
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
            sorter: (a, b) => new Date(a.dateOfJoining) - new Date(b.dateOfJoining),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                // FIXED: Get status from student level first, then from userId
                const status = record.status || record.userId?.status || 'ACTIVE';
                return (
                    <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                        {status}
                    </Tag>
                );
            },
            filters: [
                { text: 'Active', value: 'ACTIVE' },
                { text: 'Inactive', value: 'INACTIVE' },
            ],
            onFilter: (value, record) => {
                const status = record.status || record.userId?.status || 'ACTIVE';
                return status === value;
            },
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
                        onClick={() => handleDelete(record._id)}
                    />
                </Space>
            ),
        },
    ];

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleEdit = (record) => {
        setEditingStudent(record);
        // FIXED: Get status from student level or userId level
        const currentStatus = record.status || record.userId?.status || 'ACTIVE';
        
        form.setFieldsValue({
            rollNo: record.rollNo,
            studentName: record.studentName,
            address: record.address,
            classId: record.classId?._id,
            dateOfJoining: record.dateOfJoining
                ? new Date(record.dateOfJoining).toISOString().split('T')[0]
                : '',
            status: currentStatus,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this student?',
            content: 'This will also delete the student login account.',
            okType: 'danger',
            onOk: async () => {
                try {
                    await axios.delete(`/api/v1/students/${id}`);
                    message.success('Student deleted successfully');
                    fetchStudents();
                } catch (err) {
                    message.error(err.response?.data?.message || 'Failed to delete student');
                }
            },
        });
    };

    const handleSave = async (values) => {
        setSubmitLoading(true);
        try {
            if (editingStudent) {
                // For update: update student details AND status
                const updateData = {
                    rollNo: values.rollNo,
                    studentName: values.studentName,
                    address: values.address,
                    classId: values.classId,
                    dateOfJoining: values.dateOfJoining,
                };
                
                // Only include status if it's being updated
                if (values.status) {
                    updateData.status = values.status;
                }
                
                await axios.patch(`/api/v1/students/${editingStudent._id}`, updateData);
                message.success('Student updated successfully');
            } else {
                // For create: create new student
                await axios.post('/api/v1/students/', {
                    email: values.email,
                    password: values.password,
                    rollNo: values.rollNo,
                    studentName: values.studentName,
                    address: values.address,
                    classId: values.classId,
                    dateOfJoining: values.dateOfJoining,
                    status: values.status || 'ACTIVE',
                });
                message.success('Student created successfully');
            }
            fetchStudents();
            handleCancel();
        } catch (err) {
            console.error('Save error:', err);
            message.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingStudent(null);
        form.resetFields();
    };

    // Debug log to check status distribution
    console.log('Students data:', students.map(s => ({
        name: s.studentName,
        studentStatus: s.status,
        userStatus: s.userId?.status,
        finalStatus: s.status || s.userId?.status
    })));

    return (
        <div>
            {/* ── Stat Cards ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable className="hover-card" title="Total Students" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#1890ff' }}>{totalStudents}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable className="hover-card" title="Active Students" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>{activeStudents}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable className="hover-card" title="Inactive Students" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f' }}>{inactiveStudents}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable className="hover-card" title="Pending Fee" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#faad14' }}>Rs {totalPending}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable title="Total Present" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>{totalPresent}</div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable title="Total Absent" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f' }}>{totalAbsent}</div>
                    </Card>
                </Col>
            </Row>

            {/* ── Search + Add Button ── */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <Input
                    placeholder="Search by name, roll no or email..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 320 }}
                    allowClear
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingStudent(null);
                        form.resetFields();
                        form.setFieldsValue({ status: 'ACTIVE' });
                        setIsModalVisible(true);
                    }}
                >
                    Add Student
                </Button>
            </div>

            {/* ── Table ── */}
            <Table
                columns={columns}
                dataSource={students}
                rowKey="_id"
                loading={tableLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} students`,
                }}
            />

            {/* ── Add / Edit Modal ── */}
            <Modal
                title={editingStudent ? 'Edit Student' : 'Add New Student'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
                width={600}
            >
                <Form layout="vertical" onFinish={handleSave} form={form}>
                    <Form.Item
                        name="rollNo"
                        label="Roll No"
                        rules={[{ required: true, message: 'Please enter roll number' }]}
                    >
                        <Input placeholder="e.g. 2024-CS-001" />
                    </Form.Item>

                    <Form.Item
                        name="studentName"
                        label="Student Name"
                        rules={[{ required: true, message: 'Please enter student name' }]}
                    >
                        <Input />
                    </Form.Item>

                    {/* Email + Password only on CREATE */}
                    {!editingStudent && (
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
                        name="classId"
                        label="Class"
                        rules={[{ required: true, message: 'Please select a class' }]}
                    >
                        <Select 
                            placeholder="Select a class" 
                            loading={classes.length === 0}
                            showSearch
                            optionFilterProp="children"
                        >
                            {classes.map((cls) => (
                                <Option key={cls._id} value={cls._id}>
                                    {cls.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="address" label="Address">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item
                        name="dateOfJoining"
                        label="Date of Joining"
                        rules={[{ required: true, message: 'Please enter date of joining' }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    {/* Status Field - Visible in both Add and Edit modes */}
                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select placeholder="Select status">
                            <Option value="ACTIVE">
                                <Space>
                                    <Tag color="green">ACTIVE</Tag>
                                    <span>Active Student</span>
                                </Space>
                            </Option>
                            <Option value="INACTIVE">
                                <Space>
                                    <Tag color="red">INACTIVE</Tag>
                                    <span>Inactive Student</span>
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
                            {editingStudent ? 'Update Student' : 'Add Student'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Students;