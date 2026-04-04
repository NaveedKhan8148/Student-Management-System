import React, { useMemo, useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, message, Card, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { studentsData as initialData } from '../data/students';
import { feesData } from '../data/fees';
import { attendanceData } from '../data/attendance';
import { teacherClassCards } from '../data/teacherClassCards';

const { Option } = Select;

const Students = () => {
    const [students, setStudents] = useState(initialData);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);
    const [form] = Form.useForm();

    const classOptions = useMemo(() => {
        const fromStudents = initialData.map((student) => student.class);
        const fromClasses = teacherClassCards.map((item) => item.label);
        return Array.from(new Set([...fromStudents, ...fromClasses]));
    }, []);

    const totalStudents = students.length;
    const totalCollected = feesData
        .filter((item) => item.status === 'Paid')
        .reduce((sum, item) => sum + item.amount, 0);
    const totalPending = feesData
        .filter((item) => item.status === 'Pending')
        .reduce((sum, item) => sum + item.amount, 0);
    const totalPresent = attendanceData.filter((item) => item.status === 'Present').length;
    const totalAbsent = attendanceData.filter((item) => item.status === 'Absent').length;

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Roll No',
            dataIndex: 'rollNo',
            key: 'rollNo',
        },
        {
            title: 'Student Name',
            dataIndex: 'studentName',
            key: 'studentName',
            filteredValue: [searchText],
            onFilter: (value, record) => {
                return (
                    String(record.studentName).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.id).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.email).toLowerCase().includes(value.toLowerCase())
                );
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Class',
            dataIndex: 'class',
            key: 'class',
        },
        {
            title: 'Father Name',
            dataIndex: 'fatherName',
            key: 'fatherName',
        },
        {
            title: 'Father Contact',
            dataIndex: 'fatherContactNumber',
            key: 'fatherContactNumber',
        },
        {
            title: 'Date of Joining',
            dataIndex: 'dateOfJoining',
            key: 'dateOfJoining',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
            ),
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
        setEditingStudent(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (key) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this student?',
            onOk: () => {
                setStudents(students.filter((s) => s.key !== key));
                message.success('Student deleted successfully');
            },
        });
    };

    const handleSave = (values) => {
        if (editingStudent) {
            const updatedStudents = students.map((s) =>
                s.key === editingStudent.key
                    ? { ...s, ...values, password: values.password ?? s.password }
                    : s
            );
            setStudents(updatedStudents);
            message.success('Student updated successfully');
        } else {
            const newStudent = {
                key: String(students.length + 1),
                id: `STU00${students.length + 1}`,
                rollNo: values.rollNo,
                studentName: values.studentName,
                email: values.email,
                address: values.address,
                class: values.class,
                fatherName: values.fatherName,
                fatherContactNumber: values.fatherContactNumber,
                dateOfJoining: values.dateOfJoining,
                password: values.password,
                role: values.role || 'student',
                status: values.status || 'Active',
            };
            setStudents([...students, newStudent]);
            message.success('Student added successfully');
        }

        setIsModalVisible(false);
        setEditingStudent(null);
        form.resetFields();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingStudent(null);
        form.resetFields();
    };

    return (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12} lg={8}>
                    <Card hoverable className="hover-card" title="Total students" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>{totalStudents}</div>
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={8}>
                    <Card hoverable className="hover-card" title="Collected fee" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>Rs {totalCollected}</div>
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={8}>
                    <Card hoverable className="hover-card" title="Pending fee" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>Rs {totalPending}</div>
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={8}>
                    <Card hoverable title="Total present" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>{totalPresent}</div>
                    </Card>
                </Col>
                <Col xs={24} md={12} lg={8}>
                    <Card hoverable title="Total absent" bordered>
                        <div style={{ fontSize: 28, fontWeight: 700 }}>{totalAbsent}</div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                <Col>
                    <Button type="default" onClick={() => setIsModalVisible(true)}>
                        Add Student
                    </Button>
                </Col>
                <Col>
                    <Button type="default" onClick={() => message.info('Fee section available in sidebar')}>
                        Fee Section
                    </Button>
                </Col>
                <Col>
                    <Button type="default" onClick={() => message.info('Timetable feature available in sidebar')}>
                        Add Timetable
                    </Button>
                </Col>
            </Row>

            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input
                    placeholder="Search students..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingStudent(null);
                        form.resetFields();
                        setIsModalVisible(true);
                    }}
                >
                    Add Student
                </Button>
            </div>

            <Table columns={columns} dataSource={students} />

            <Modal
                title={editingStudent ? 'Edit Student' : 'Add New Student'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleSave} form={form}>
                    <Form.Item
                        name="rollNo"
                        label="Roll No"
                        rules={[{ required: true, message: 'Please enter roll number' }]}
                    >
                        <Input placeholder="e.g. CS-2026-099" />
                    </Form.Item>
                    <Form.Item
                        name="studentName"
                        label="Student Name"
                        rules={[{ required: true, message: 'Please enter student name' }]}
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
                        name="password"
                        label="Password"
                        rules={editingStudent ? [] : [{ required: true, message: 'Please enter a password' }]}
                    >
                        <Input.Password placeholder="Enter login password" />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item
                        name="class"
                        label="Class"
                        rules={[{ required: true, message: 'Please select a class' }]}
                    >
                        <Select placeholder="Choose a class">
                            {classOptions.map((label) => (
                                <Option key={label} value={label}>
                                    {label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="fatherName"
                        label="Father Name"
                        rules={[{ required: true, message: 'Please enter father name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="fatherContactNumber"
                        label="Father Contact Number"
                        rules={[{ required: true, message: 'Please enter father contact number' }]}
                    >
                        <Input placeholder="+92-300-1234567" />
                    </Form.Item>
                    <Form.Item
                        name="dateOfJoining"
                        label="Date of Joining"
                        rules={[{ required: true, message: 'Please enter date of joining' }]}
                    >
                        <Input placeholder="2023/09/01" />
                    </Form.Item>
                    <Form.Item name="status" label="Status" initialValue="Active">
                        <Select>
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                            <Option value="Graduated">Graduated</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Role"
                        initialValue="student"
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
                            {editingStudent ? 'Update Student' : 'Add Student'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Students;
