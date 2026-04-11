import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, Tag, Typography, Button, Modal, Form, Input,
    Select, message, Space, Popconfirm, Card, Row, Col,
    Statistic, DatePicker
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    ReloadOutlined, SearchOutlined, WarningOutlined,
    UserOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AcademicWarnings = () => {
    const [warnings, setWarnings] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingWarning, setEditingWarning] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (students.length > 0) {
            if (selectedStudent) {
                fetchWarningsByStudent(selectedStudent);
            } else {
                fetchWarnings();
            }
        }
    }, [students, selectedStudent]);

    // Fetch helpers
    const fetchWarnings = async () => {
        setTableLoading(true);
        try {
            const res = await axios.get('/api/v1/warnings/');
            setWarnings(enrichWarnings(res.data.data));
        } catch {
            message.error('Failed to fetch warnings');
        } finally {
            setTableLoading(false);
        }
    };

    const fetchWarningsByStudent = async (studentId) => {
        setTableLoading(true);
        try {
            const res = await axios.get(`/api/v1/warnings/student/${studentId}`);
            setWarnings(enrichWarnings(res.data.data));
        } catch {
            message.error('Failed to fetch warnings for student');
        } finally {
            setTableLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/v1/students/');
            setStudents(res.data.data);
        } catch {
            message.error('Failed to fetch students');
        }
    };

    // Attach studentName + rollNo from students list
    const enrichWarnings = (data) => {
        return data.map((w) => {
            // Get student ID correctly (handle both populated and unpopulated)
            let studentId = w.studentId;
            if (typeof w.studentId === 'object' && w.studentId !== null) {
                studentId = w.studentId._id;
            }
            
            const foundStudent = students.find((s) => s._id === studentId);
            
            return {
                ...w,
                studentId: studentId, // Store just the ID for consistency
                studentName: foundStudent?.studentName || w.studentId?.studentName || 'Unknown Student',
                rollNo: foundStudent?.rollNo || w.studentId?.rollNo || 'N/A',
                warningDate: w.warningDate,
            };
        });
    };

    // Filter warnings based on search text
    const filteredWarnings = useMemo(() => {
        if (!searchText) return warnings;
        
        return warnings.filter((record) =>
            (record.studentName || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (record.ruleViolated || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (record.detailDescription || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (record.rollNo || '').toLowerCase().includes(searchText.toLowerCase())
        );
    }, [warnings, searchText]);

    // Stats based on FILTERED warnings
    const totalWarnings = filteredWarnings.length;
    const uniqueStudents = new Set(
        filteredWarnings.map((w) => w.studentId)
    ).size;

    // Handlers
    const handleCreate = async (values) => {
        setSubmitLoading(true);
        try {
            await axios.post('/api/v1/warnings/', {
                studentId: values.studentId,
                ruleViolated: values.ruleViolated,
                detailDescription: values.detailDescription,
                warningDate: values.warningDate
                    ? values.warningDate.format('YYYY-MM-DD')
                    : dayjs().format('YYYY-MM-DD'),
            });
            message.success('Warning issued successfully');
            setIsModalVisible(false);
            form.resetFields();
            if (selectedStudent) {
                fetchWarningsByStudent(selectedStudent);
            } else {
                fetchWarnings();
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to issue warning');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditOpen = (record) => {
        setEditingWarning(record);
        editForm.setFieldsValue({
            ruleViolated: record.ruleViolated,
            detailDescription: record.detailDescription,
        });
        setIsEditModalVisible(true);
    };

    const handleEditSave = async (values) => {
        setSubmitLoading(true);
        try {
            await axios.patch(`/api/v1/warnings/${editingWarning._id}`, {
                ruleViolated: values.ruleViolated,
                detailDescription: values.detailDescription,
            });
            message.success('Warning updated successfully');
            setIsEditModalVisible(false);
            editForm.resetFields();
            setEditingWarning(null);
            if (selectedStudent) {
                fetchWarningsByStudent(selectedStudent);
            } else {
                fetchWarnings();
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to update warning');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/v1/warnings/${id}`);
            message.success('Warning deleted');
            if (selectedStudent) {
                fetchWarningsByStudent(selectedStudent);
            } else {
                fetchWarnings();
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to delete warning');
        }
    };

    const clearFilters = () => {
        setSelectedStudent(null);
        setSearchText('');
    };

    // Table columns
    const columns = [
        {
            title: 'Student',
            dataIndex: 'studentName',
            key: 'studentName',
            sorter: (a, b) => (a.studentName || '').localeCompare(b.studentName || ''),
            render: (name, record) => (
                <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <span>{name}</span>
                    <Tag color="default">{record.rollNo}</Tag>
                </Space>
            ),
        },
        {
            title: 'Rule Violated',
            dataIndex: 'ruleViolated',
            key: 'ruleViolated',
            render: (rule) => <Tag color="orange" icon={<ExclamationCircleOutlined />}>{rule}</Tag>,
            filters: [
                { text: 'Attendance Below 75%', value: 'Attendance Below 75%' },
                { text: 'Failed in Multiple Subjects', value: 'Failed in Multiple Subjects' },
                { text: 'Repeated Misconduct', value: 'Repeated Misconduct' },
                { text: 'Late Submission of Assignments', value: 'Late Submission of Assignments' },
                { text: 'Exam Malpractice', value: 'Exam Malpractice' },
            ],
            onFilter: (value, record) => record.ruleViolated === value,
        },
        {
            title: 'Description',
            dataIndex: 'detailDescription',
            key: 'detailDescription',
            ellipsis: true,
            width: 300,
        },
        {
            title: 'Warning Date',
            dataIndex: 'warningDate',
            key: 'warningDate',
            render: (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '-'),
            sorter: (a, b) =>
                dayjs(a.warningDate).unix() - dayjs(b.warningDate).unix(),
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditOpen(record)}
                    />
                    <Popconfirm
                        title="Delete this warning?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Academic Warnings
                </Title>
                <Text type="secondary">
                    Track and manage academic warnings issued to students
                </Text>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card 
                        hoverable 
                        style={{ 
                            borderTop: '4px solid #ff4d4f',
                            borderRadius: '10px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                                    <WarningOutlined /> Total Warnings
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff4d4f' }}>
                                    {totalWarnings}
                                </div>
                                {searchText && (
                                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                                        From {warnings.length} total
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: '48px', color: '#ff4d4f' }}>
                                <WarningOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                    <Card 
                        hoverable 
                        style={{ 
                            borderTop: '4px solid #faad14',
                            borderRadius: '10px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                                    <UserOutlined /> Students with Warnings
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>
                                    {uniqueStudents}
                                </div>
                            </div>
                            <div style={{ fontSize: '48px', color: '#faad14' }}>
                                <UserOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={8}>
                    <Card 
                        hoverable 
                        style={{ 
                            borderTop: '4px solid #1890ff',
                            borderRadius: '10px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                                    <UserOutlined /> Total Students
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                                    {students.length}
                                </div>
                            </div>
                            <div style={{ fontSize: '48px', color: '#1890ff' }}>
                                <UserOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Controls */}
            <Card style={{ marginBottom: 16, borderRadius: '10px' }}>
                <Space wrap size="middle">
                    <div>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>
                            Filter by Student
                        </div>
                        <Select
                            placeholder="All Students"
                            style={{ width: 250 }}
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            onChange={(val) => setSelectedStudent(val)}
                            value={selectedStudent}
                        >
                            {students.map((s) => (
                                <Option key={s._id} value={s._id}>
                                    {s.studentName} — {s.rollNo}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>
                            Search
                        </div>
                        <Input
                            placeholder="Search by student / rule / description..."
                            prefix={<SearchOutlined />}
                            allowClear
                            style={{ width: 260 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    {(selectedStudent || searchText) && (
                        <Button onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </Space>
            </Card>

            {/* Action buttons */}
            <div style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ margin: 0, fontWeight: 600 }}>⚠️ Warning Records</h3>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            if (selectedStudent) {
                                fetchWarningsByStudent(selectedStudent);
                            } else {
                                fetchWarnings();
                            }
                        }}
                    >
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    >
                        Issue Warning
                    </Button>
                </Space>
            </div>

            {/* Table - showing filtered warnings */}
            <Table
                columns={columns}
                dataSource={filteredWarnings}
                rowKey="_id"
                loading={tableLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} warnings`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                scroll={{ x: 1000 }}
                locale={{
                    emptyText: selectedStudent ? 'No warnings for this student' : 'No warnings found'
                }}
            />

            {/* Create Modal */}
            <Modal
                title="⚠️ Issue Academic Warning"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
                width={550}
            >
                <Form layout="vertical" onFinish={handleCreate} form={form}>
                    <Form.Item
                        name="studentId"
                        label="Student"
                        rules={[{ required: true, message: 'Please select a student' }]}
                    >
                        <Select
                            placeholder="Select student"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {students.map((s) => (
                                <Option key={s._id} value={s._id}>
                                    {s.studentName} — {s.rollNo}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="ruleViolated"
                        label="Rule Violated"
                        rules={[{ required: true, message: 'Please select/enter rule violated' }]}
                    >
                        <Select
                            placeholder="Select or type a rule"
                            showSearch
                            allowClear
                            mode="combobox"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            <Option value="Attendance Below 75%">Attendance Below 75%</Option>
                            <Option value="Failed in Multiple Subjects">Failed in Multiple Subjects</Option>
                            <Option value="Repeated Misconduct">Repeated Misconduct</Option>
                            <Option value="Late Submission of Assignments">Late Submission of Assignments</Option>
                            <Option value="Exam Malpractice">Exam Malpractice</Option>
                            <Option value="Disruptive Behavior">Disruptive Behavior</Option>
                            <Option value="Incomplete Assignments">Incomplete Assignments</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="detailDescription"
                        label="Detail Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Describe the warning in detail..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item
                        name="warningDate"
                        label="Warning Date"
                        initialValue={dayjs()}
                        rules={[{ required: true, message: 'Please select warning date' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={submitLoading}
                            size="large"
                        >
                            Issue Warning
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="✏️ Update Warning"
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    editForm.resetFields();
                    setEditingWarning(null);
                }}
                footer={null}
                destroyOnClose
                width={550}
            >
                <Form layout="vertical" onFinish={handleEditSave} form={editForm}>
                    <Form.Item
                        name="ruleViolated"
                        label="Rule Violated"
                        rules={[{ required: true, message: 'Please enter rule violated' }]}
                    >
                        <Select
                            placeholder="Select or type a rule"
                            showSearch
                            allowClear
                            mode="combobox"
                        >
                            <Option value="Attendance Below 75%">Attendance Below 75%</Option>
                            <Option value="Failed in Multiple Subjects">Failed in Multiple Subjects</Option>
                            <Option value="Repeated Misconduct">Repeated Misconduct</Option>
                            <Option value="Late Submission of Assignments">Late Submission of Assignments</Option>
                            <Option value="Exam Malpractice">Exam Malpractice</Option>
                            <Option value="Disruptive Behavior">Disruptive Behavior</Option>
                            <Option value="Incomplete Assignments">Incomplete Assignments</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="detailDescription"
                        label="Detail Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <TextArea rows={4} maxLength={500} showCount />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={submitLoading}
                            size="large"
                        >
                            Update Warning
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AcademicWarnings;