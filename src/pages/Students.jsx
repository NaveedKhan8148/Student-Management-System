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
        const fromStudents = initialData.map((student) => student.classLabel);
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
            title: 'Roll #',
            dataIndex: 'rollNumber',
            key: 'rollNumber',
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
                    String(record.program).toLowerCase().includes(value.toLowerCase())
                );
            },
        },
        {
            title: 'Class',
            dataIndex: 'classLabel',
            key: 'classLabel',
        },
        {
            title: 'Program',
            dataIndex: 'program',
            key: 'program',
            filters: [
                { text: 'Computer Science', value: 'Computer Science' },
                { text: 'Business Administration', value: 'Business Administration' },
                { text: 'Engineering', value: 'Engineering' },
                { text: 'Arts', value: 'Arts' },
            ],
            onFilter: (value, record) => record.program === value,
        },
        {
            title: 'Enrollment Date',
            dataIndex: 'enrollmentDate',
            key: 'enrollmentDate',
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
                s.key === editingStudent.key ? { ...s, ...values } : s
            );
            setStudents(updatedStudents);
            message.success('Student updated successfully');
        } else {
            const newStudent = {
                key: String(students.length + 1),
                id: `STU00${students.length + 1}`,
                ...values,
                enrollmentDate: new Date().toISOString().split('T')[0],
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
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter student name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="rollNumber"
                        label="Roll number"
                        rules={[{ required: true, message: 'Please enter roll number' }]}
                    >
                        <Input placeholder="e.g. CS-2026-099" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="program"
                        label="Program"
                        rules={[{ required: true, message: 'Please select a program' }]}
                    >
                        <Select>
                            <Option value="Computer Science">Computer Science</Option>
                            <Option value="Business Administration">Business Administration</Option>
                            <Option value="Engineering">Engineering</Option>
                            <Option value="Arts">Arts</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="classLabel"
                        label="Class label"
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
                        name="contact"
                        label="Contact Number"
                        rules={[{ required: true, message: 'Please enter contact number' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="status" label="Status" initialValue="Active">
                        <Select>
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                            <Option value="Graduated">Graduated</Option>
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
