import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, Tag, Typography, Button, Space, Modal, Form,
    Input, Select, message, Card, Row, Col, Statistic,
    Popconfirm, Tooltip, Avatar, Timeline, Badge, Progress, Tabs
} from 'antd';
import {
    PlusOutlined, ReloadOutlined, CheckOutlined,
    CloseOutlined, DeleteOutlined, SearchOutlined, UserOutlined,
    FileTextOutlined, DollarOutlined, BookOutlined,
    CalendarOutlined, ClockCircleOutlined, EyeOutlined,
    MessageOutlined, CheckCircleOutlined, CloseCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ApprovalWorkflows = () => {
    const [rows, setRows] = useState([]);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isRemarksModalVisible, setIsRemarksModalVisible] = useState(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [typeFilter, setTypeFilter] = useState(null);
    const [form] = Form.useForm();
    const [remarksForm] = Form.useForm();

    useEffect(() => {
        fetchWorkflows();
        fetchStats();
        fetchStudents();
    }, []);

    useEffect(() => {
        fetchWorkflows();
    }, [statusFilter, typeFilter]);

    // Fetch helpers
    const fetchWorkflows = async () => {
        setTableLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (typeFilter) params.append('type', typeFilter);
            const res = await axios.get(`/api/v1/workflows/?${params.toString()}`);
            setRows(res.data.data);
        } catch {
            message.error('Failed to fetch workflows');
        } finally {
            setTableLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/v1/workflows/stats');
            setStats(res.data.data);
        } catch {
            // silent
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

    // Filtered data
    const filteredRows = useMemo(() => {
        if (!searchText) return rows;
        return rows.filter((record) => {
            const requester = record.requesterName || record.requesterId?.email || '';
            const student = record.studentId?.studentName || '';
            return (
                requester.toLowerCase().includes(searchText.toLowerCase()) ||
                student.toLowerCase().includes(searchText.toLowerCase()) ||
                (record.description || '').toLowerCase().includes(searchText.toLowerCase()) ||
                (record.type || '').toLowerCase().includes(searchText.toLowerCase())
            );
        });
    }, [rows, searchText]);

    // Handlers
    const handleCreate = async (values) => {
        setSubmitLoading(true);
        try {
            await axios.post('/api/v1/workflows/', {
                type: values.type,
                studentId: values.studentId,
                description: values.description,
                remarks: values.remarks || '',
            });
            message.success('Workflow request submitted successfully');
            setIsModalVisible(false);
            form.resetFields();
            fetchWorkflows();
            fetchStats();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleActionClick = (id, action) => {
        setPendingAction({ id, action });
        remarksForm.resetFields();
        setIsRemarksModalVisible(true);
    };

    const handleActionConfirm = async (values) => {
        if (!pendingAction) return;
        setSubmitLoading(true);
        try {
            await axios.patch(
                `/api/v1/workflows/${pendingAction.id}/${pendingAction.action}`,
                { remarks: values.remarks || '' }
            );
            message.success(
                `Workflow ${pendingAction.action === 'approve' ? 'approved' : 'rejected'} successfully`
            );
            setIsRemarksModalVisible(false);
            remarksForm.resetFields();
            setPendingAction(null);
            fetchWorkflows();
            fetchStats();
        } catch (err) {
            message.error(err.response?.data?.message || 'Action failed');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/v1/workflows/${id}`);
            message.success('Workflow request deleted');
            fetchWorkflows();
            fetchStats();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const handleViewDetails = (record) => {
        setSelectedRequest(record);
        setIsDetailsModalVisible(true);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Fee concession': return <DollarOutlined />;
            case 'Result correction': return <BookOutlined />;
            case 'Attendance adjustment': return <CalendarOutlined />;
            default: return <FileTextOutlined />;
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Approved':
                return { color: '#52c41a', icon: <CheckCircleOutlined />, bgColor: '#f6ffed' };
            case 'Rejected':
                return { color: '#ff4d4f', icon: <CloseCircleOutlined />, bgColor: '#fff2f0' };
            default:
                return { color: '#faad14', icon: <ClockCircleOutlined />, bgColor: '#fff7e6' };
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Request Type',
            dataIndex: 'type',
            key: 'type',
            width: 180,
            render: (type) => {
                const colorMap = {
                    'Fee concession': 'purple',
                    'Result correction': 'blue',
                    'Attendance adjustment': 'cyan'
                };
                return (
                    <Tag color={colorMap[type] || 'default'} icon={getTypeIcon(type)}>
                        {type}
                    </Tag>
                );
            },
        },
        {
            title: 'Student',
            key: 'student',
            width: 200,
            render: (_, r) => {
                const student = r.studentId;
                if (!student) return <Tag color="default">—</Tag>;
                return (
                    <Tooltip title={`Roll No: ${student.rollNo} | Class: ${student.classId?.name || '-'}`}>
                        <Space>
                            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                            <div>
                                <div style={{ fontWeight: 500 }}>{student.studentName}</div>
                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>{student.rollNo}</div>
                            </div>
                        </Space>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            width: 300,
            render: (text) => (
                <Tooltip title={text}>
                    <Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0 }}>
                        {text}
                    </Paragraph>
                </Tooltip>
            ),
        },
        {
            title: 'Submitted',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (d) => (
                <Tooltip title={dayjs(d).format('YYYY-MM-DD HH:mm:ss')}>
                    <Space>
                        <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                        <span>{dayjs(d).fromNow()}</span>
                    </Space>
                </Tooltip>
            ),
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (s) => {
                const config = getStatusConfig(s);
                return (
                    <Badge 
                        color={config.color} 
                        text={
                            <span style={{ color: config.color, fontWeight: 500 }}>
                                {config.icon} {s}
                            </span>
                        }
                    />
                );
            },
            filters: [
                { text: 'Pending', value: 'Pending' },
                { text: 'Approved', value: 'Approved' },
                { text: 'Rejected', value: 'Rejected' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Action',
            key: 'action',
            width: 250,
            render: (_, record) =>
                record.status === 'Pending' ? (
                    <Space size="small">
                        <Tooltip title="Approve Request">
                            <Button
                                size="small"
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => handleActionClick(record._id, 'approve')}
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            >
                                Approve
                            </Button>
                        </Tooltip>
                        <Tooltip title="Reject Request">
                            <Button
                                size="small"
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => handleActionClick(record._id, 'reject')}
                            >
                                Reject
                            </Button>
                        </Tooltip>
                        <Tooltip title="View Details">
                            <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetails(record)}
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Delete this request?"
                            description="This action cannot be undone."
                            onConfirm={() => handleDelete(record._id)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Delete Request">
                                <Button size="small" icon={<DeleteOutlined />} danger />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                ) : (
                    <Space>
                        <Tooltip title="View Details">
                            <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetails(record)}
                            />
                        </Tooltip>
                        <Text type="secondary">No actions available</Text>
                    </Space>
                ),
        },
    ];

    // Stats Cards Data
    const statsCards = [
        {
            title: 'Total Requests',
            value: stats.total,
            icon: <FileTextOutlined />,
            color: '#1890ff',
            bgColor: '#e6f7ff'
        },
        {
            title: 'Pending',
            value: stats.pending,
            icon: <ClockCircleOutlined />,
            color: '#faad14',
            bgColor: '#fff7e6'
        },
        {
            title: 'Approved',
            value: stats.approved,
            icon: <CheckCircleOutlined />,
            color: '#52c41a',
            bgColor: '#f6ffed'
        },
        {
            title: 'Rejected',
            value: stats.rejected,
            icon: <CloseCircleOutlined />,
            color: '#ff4d4f',
            bgColor: '#fff2f0'
        }
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    Digital Approval Workflows
                </Title>
                <Text type="secondary">
                    Manage fee concessions, result corrections, and attendance adjustments
                </Text>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {statsCards.map((card, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card 
                            hoverable 
                            style={{ 
                                borderTop: `4px solid ${card.color}`,
                                borderRadius: '10px',
                                backgroundColor: card.bgColor
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                                        {card.title}
                                    </div>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: card.color }}>
                                        {card.value}
                                    </div>
                                </div>
                                <div style={{ fontSize: '48px', color: card.color }}>
                                    {card.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filters Card */}
            <Card style={{ marginBottom: 16, borderRadius: '10px' }}>
                <Space wrap size="middle" style={{ width: '100%' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>
                            Search
                        </div>
                        <Input
                            placeholder="Search by requester, student, or description..."
                            prefix={<SearchOutlined />}
                            allowClear
                            style={{ width: '100%' }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    
                    <div style={{ minWidth: 160 }}>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>
                            Status
                        </div>
                        <Select
                            placeholder="All Status"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(val) => setStatusFilter(val)}
                            value={statusFilter}
                        >
                            <Option value="Pending">⏳ Pending</Option>
                            <Option value="Approved">✅ Approved</Option>
                            <Option value="Rejected">❌ Rejected</Option>
                        </Select>
                    </div>

                    <div style={{ minWidth: 200 }}>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>
                            Request Type
                        </div>
                        <Select
                            placeholder="All Types"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(val) => setTypeFilter(val)}
                            value={typeFilter}
                        >
                            <Option value="Fee concession">💰 Fee Concession</Option>
                            <Option value="Result correction">📚 Result Correction</Option>
                            <Option value="Attendance adjustment">📅 Attendance Adjustment</Option>
                        </Select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => { fetchWorkflows(); fetchStats(); }}
                            >
                                Refresh
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsModalVisible(true)}
                            >
                                New Request
                            </Button>
                        </Space>
                    </div>
                </Space>
            </Card>

            {/* Table */}
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={filteredRows}
                loading={tableLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} requests`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                scroll={{ x: 1200 }}
                style={{ borderRadius: '10px' }}
            />

            {/* Create Request Modal */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined style={{ color: '#1890ff' }} />
                        <span>Submit New Request</span>
                    </Space>
                }
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
                        name="type"
                        label="Request Type"
                        rules={[{ required: true, message: 'Please select request type' }]}
                    >
                        <Select placeholder="Select request type" size="large">
                            <Option value="Fee concession">
                                <Space><DollarOutlined /> Fee Concession</Space>
                            </Option>
                            <Option value="Result correction">
                                <Space><BookOutlined /> Result Correction</Space>
                            </Option>
                            <Option value="Attendance adjustment">
                                <Space><CalendarOutlined /> Attendance Adjustment</Space>
                            </Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="studentId"
                        label="Associated Student"
                        rules={[{ required: true, message: 'Please select a student' }]}
                    >
                        <Select
                            placeholder="Select student"
                            showSearch
                            optionFilterProp="children"
                            size="large"
                        >
                            {students.map((s) => (
                                <Option key={s._id} value={s._id}>
                                    {s.studentName} — {s.rollNo}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Describe the request in detail..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item 
                        name="remarks" 
                        label="Remarks (Optional)"
                        extra="Any additional notes or comments"
                    >
                        <Input placeholder="e.g., Urgent request, supporting documents attached" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={submitLoading}
                            size="large"
                            icon={<FileTextOutlined />}
                        >
                            Submit Request
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Approve/Reject Remarks Modal */}
            <Modal
                title={
                    <Space>
                        {pendingAction?.action === 'approve' ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                        ) : (
                            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                        )}
                        <span>
                            {pendingAction?.action === 'approve' ? 'Approve Workflow' : 'Reject Workflow'}
                        </span>
                    </Space>
                }
                open={isRemarksModalVisible}
                onCancel={() => {
                    setIsRemarksModalVisible(false);
                    remarksForm.resetFields();
                    setPendingAction(null);
                }}
                footer={null}
                destroyOnClose
                width={500}
            >
                <Form layout="vertical" onFinish={handleActionConfirm} form={remarksForm}>
                    <Form.Item 
                        name="remarks" 
                        label="Remarks"
                        extra={pendingAction?.action === 'approve' 
                            ? "Optional: Add approval notes" 
                            : "Optional: Provide reason for rejection"}
                    >
                        <TextArea
                            rows={4}
                            placeholder={
                                pendingAction?.action === 'approve'
                                    ? 'e.g., Approved after verification, all documents are valid'
                                    : 'e.g., Insufficient documentation, please resubmit with proper documents'
                            }
                            maxLength={300}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setIsRemarksModalVisible(false);
                                remarksForm.resetFields();
                                setPendingAction(null);
                            }}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitLoading}
                                danger={pendingAction?.action === 'reject'}
                                style={pendingAction?.action === 'approve' ? { backgroundColor: '#52c41a' } : {}}
                            >
                                {pendingAction?.action === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Details Modal */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined style={{ color: '#1890ff' }} />
                        <span>Request Details</span>
                    </Space>
                }
                open={isDetailsModalVisible}
                onCancel={() => {
                    setIsDetailsModalVisible(false);
                    setSelectedRequest(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setIsDetailsModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedRequest && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Text type="secondary">Request Type</Text>
                                    <div>
                                        <Tag color="purple" icon={getTypeIcon(selectedRequest.type)}>
                                            {selectedRequest.type}
                                        </Tag>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Status</Text>
                                    <div>
                                        <Badge 
                                            color={getStatusConfig(selectedRequest.status).color}
                                            text={selectedRequest.status}
                                        />
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Student</Text>
                                    <div style={{ fontWeight: 500 }}>
                                        {selectedRequest.studentId?.studentName || '-'}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Roll No: {selectedRequest.studentId?.rollNo || '-'}
                                    </Text>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary">Submitted</Text>
                                    <div>{dayjs(selectedRequest.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {dayjs(selectedRequest.createdAt).fromNow()}
                                    </Text>
                                </Col>
                            </Row>
                        </Card>

                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Description</Text>
                            <Paragraph style={{ marginTop: 8, padding: 12, backgroundColor: '#fafafa', borderRadius: 8 }}>
                                {selectedRequest.description}
                            </Paragraph>
                        </div>

                        {selectedRequest.remarks && (
                            <div style={{ marginBottom: 16 }}>
                                <Text strong>
                                    <MessageOutlined /> Remarks
                                </Text>
                                <Paragraph style={{ marginTop: 8, padding: 12, backgroundColor: '#fafafa', borderRadius: 8 }}>
                                    {selectedRequest.remarks}
                                </Paragraph>
                            </div>
                        )}

                        {selectedRequest.status !== 'Pending' && (
                            <div style={{ 
                                padding: 12, 
                                backgroundColor: getStatusConfig(selectedRequest.status).bgColor,
                                borderRadius: 8,
                                borderLeft: `4px solid ${getStatusConfig(selectedRequest.status).color}`
                            }}>
                                <Text strong>
                                    {getStatusConfig(selectedRequest.status).icon} 
                                    {' '}{selectedRequest.status} Information
                                </Text>
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">
                                        {selectedRequest.status === 'Approved' 
                                            ? 'This request has been approved and processed.'
                                            : 'This request has been rejected. Please contact support for more information.'}
                                    </Text>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ApprovalWorkflows;