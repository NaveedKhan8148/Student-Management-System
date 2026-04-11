import React, { useState, useEffect } from 'react';
import {
    Table, Button, Card, Statistic, Row, Col, Tag, Modal,
    Form, Input, Select, DatePicker, message, Space, Popconfirm
} from 'antd';
import {
    PlusOutlined, PrinterOutlined, ReloadOutlined,
    CheckOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

const Fees = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [fees, setFees] = useState([]);
    const [allFees, setAllFees] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchFeesByStudent(selectedStudent);
        } else {
            setFees([]);
        }
    }, [selectedStudent]);

    // Helper function to extract amount from Decimal128
    const extractAmount = (amount) => {
        if (!amount) return 0;
        // Handle Decimal128 format: { $numberDecimal: "15000" }
        if (typeof amount === 'object' && amount.$numberDecimal) {
            return parseFloat(amount.$numberDecimal);
        }
        // Handle direct number or string
        return parseFloat(amount) || 0;
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/v1/students/');
            setStudents(res.data.data || []);
        } catch {
            message.error('Failed to fetch students');
        }
    };

    const fetchFeesByStudent = async (studentId) => {
        setTableLoading(true);
        try {
            const res = await axios.get(`/api/v1/fees/student/${studentId}`);
            const feesData = res.data.data || [];
            // Process amounts
            const processedFees = feesData.map(fee => ({
                ...fee,
                amount: extractAmount(fee.amount)
            }));
            setFees(processedFees);
        } catch {
            message.error('Failed to fetch fees');
        } finally {
            setTableLoading(false);
        }
    };

    const fetchAllFees = async () => {
        setTableLoading(true);
        try {
            const results = await Promise.all(
                students.map((s) =>
                    axios
                        .get(`/api/v1/fees/student/${s._id}`)
                        .then((r) => {
                            const feesData = r.data.data || [];
                            return feesData.map((f) => ({
                                ...f,
                                amount: extractAmount(f.amount),
                                studentName: s.studentName,
                                rollNo: s.rollNo,
                            }));
                        })
                        .catch(() => [])
                )
            );
            setAllFees(results.flat());
        } catch {
            message.error('Failed to fetch all fees');
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        if (students.length > 0) fetchAllFees();
    }, [students]);

    // Stats from allFees with proper amount calculation
    const totalCollected = allFees
        .filter((f) => f.status === 'Paid')
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    const totalPending = allFees
        .filter((f) => f.status === 'Pending')
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    const totalOverdue = allFees
        .filter((f) => f.status === 'Overdue')
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    const overdueCount = allFees.filter((f) => f.status === 'Overdue').length;

    // PDF receipt
    const generateReceipt = (record) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Fee Receipt', 105, 20, null, null, 'center');
        doc.setFontSize(12);
        doc.text(`Student: ${record.studentName || '-'}`, 20, 40);
        doc.text(`Fee Type: ${record.feeType}`, 20, 50);
        doc.text(`Due Date: ${dayjs(record.dueDate).format('YYYY-MM-DD')}`, 20, 60);
        doc.text(
            `Paid Date: ${record.paidDate ? dayjs(record.paidDate).format('YYYY-MM-DD') : '-'}`,
            20, 70
        );
        autoTable(doc, {
            startY: 80,
            head: [['Fee Type', 'Amount', 'Status']],
            body: [[record.feeType, `Rs ${Number(record.amount).toLocaleString()}`, record.status]],
        });
        doc.text(
            'Thank you!',
            105,
            doc.lastAutoTable.finalY + 20,
            null, null, 'center'
        );
        doc.save(`Receipt_${record._id}.pdf`);
        message.success('Receipt downloaded');
    };

    // Handlers
    const handleCreateFee = async (values) => {
        setSubmitLoading(true);
        try {
            await axios.post('/api/v1/fees/', {
                studentId: values.studentId,
                feeType: values.feeType,
                amount: Number(values.amount),
                dueDate: values.dueDate.format('YYYY-MM-DD'),
            });
            message.success('Fee record created successfully');
            setIsModalVisible(false);
            form.resetFields();
            if (selectedStudent === values.studentId) {
                fetchFeesByStudent(selectedStudent);
            }
            fetchAllFees();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to create fee');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleMarkPaid = async (feeId) => {
        try {
            await axios.patch(`/api/v1/fees/${feeId}/pay`);
            message.success('Fee marked as paid');
            if (selectedStudent) fetchFeesByStudent(selectedStudent);
            fetchAllFees();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to mark as paid');
        }
    };

    const handleEditOpen = (record) => {
        setEditingFee(record);
        editForm.setFieldsValue({
            amount: record.amount,
            dueDate: dayjs(record.dueDate),
            status: record.status,
        });
        setIsEditModalVisible(true);
    };

    const handleEditSave = async (values) => {
        setSubmitLoading(true);
        try {
            await axios.patch(`/api/v1/fees/${editingFee._id}`, {
                amount: Number(values.amount),
                dueDate: values.dueDate.format('YYYY-MM-DD'),
                status: values.status,
            });
            message.success('Fee updated successfully');
            setIsEditModalVisible(false);
            editForm.resetFields();
            setEditingFee(null);
            if (selectedStudent) fetchFeesByStudent(selectedStudent);
            fetchAllFees();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to update fee');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (feeId) => {
        try {
            await axios.delete(`/api/v1/fees/${feeId}`);
            message.success('Fee deleted successfully');
            if (selectedStudent) fetchFeesByStudent(selectedStudent);
            fetchAllFees();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to delete fee');
        }
    };

    // Table columns
    const statusColor = (status) => {
        if (status === 'Paid') return 'green';
        if (status === 'Overdue') return 'red';
        return 'orange';
    };

    const feeColumns = [
        {
            title: 'Student',
            key: 'student',
            render: (_, r) => r.studentName || r.studentId?.studentName || '-',
            sorter: (a, b) => (a.studentName || '').localeCompare(b.studentName || ''),
        },
        {
            title: 'Roll No',
            key: 'rollNo',
            render: (_, r) => r.rollNo || '-',
        },
        {
            title: 'Fee Type',
            dataIndex: 'feeType',
            key: 'feeType',
            filters: [
                { text: 'Tuition', value: 'Tuition' },
                { text: 'Lab', value: 'Lab' },
                { text: 'Library', value: 'Library' },
            ],
            onFilter: (value, record) => record.feeType === value,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `Rs ${Number(amount).toLocaleString()}`,
            sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (d) => dayjs(d).format('YYYY-MM-DD'),
            sorter: (a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
        },
        {
            title: 'Paid Date',
            dataIndex: 'paidDate',
            key: 'paidDate',
            render: (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '-'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s) => <Tag color={statusColor(s)}>{s}</Tag>,
            filters: [
                { text: 'Paid', value: 'Paid' },
                { text: 'Pending', value: 'Pending' },
                { text: 'Overdue', value: 'Overdue' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Action',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="small" wrap>
                    {record.status !== 'Paid' && (
                        <Popconfirm
                            title="Mark this fee as paid?"
                            onConfirm={() => handleMarkPaid(record._id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                icon={<CheckOutlined />}
                                size="small"
                                type="primary"
                                ghost
                                title="Mark Paid"
                            />
                        </Popconfirm>
                    )}
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditOpen(record)}
                        title="Edit"
                    />
                    <Button
                        icon={<PrinterOutlined />}
                        size="small"
                        onClick={() => generateReceipt(record)}
                        title="Receipt"
                    />
                    <Popconfirm
                        title="Delete this fee record?"
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

    // Filter displayed fees
    const displayFees = selectedStudent ? fees : allFees;

    const filteredFees = displayFees.filter((record) => {
        const keyword = searchText.trim().toLowerCase();
        const matchText =
            !keyword ||
            [record.feeType, record.status, record.studentName, record.rollNo]
                .some((f) => f?.toString().toLowerCase().includes(keyword));

        const due = dayjs(record.dueDate).format('YYYY-MM-DD');
        const matchDate =
            !dateRange || !dateRange[0] || !dateRange[1]
                ? true
                : due >= dateRange[0].format('YYYY-MM-DD') &&
                  due <= dateRange[1].format('YYYY-MM-DD');

        return matchText && matchDate;
    });

    return (
        <div>
            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable style={{ borderTop: '4px solid #52c41a' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                                Total Collected
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}>
                                Rs {totalCollected.toLocaleString()}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable style={{ borderTop: '4px solid #faad14' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                                Pending Dues
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#faad14' }}>
                                Rs {totalPending.toLocaleString()}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card hoverable style={{ borderTop: '4px solid #ff4d4f' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                                Overdue Amount
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff4d4f' }}>
                                Rs {totalOverdue.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '4px' }}>
                                ({overdueCount} records overdue)
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Controls */}
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }} align="middle">
                <Col xs={24} md={6}>
                    <Select
                        placeholder="Filter by student (optional)"
                        style={{ width: '100%' }}
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
                </Col>
                <Col xs={24} md={6}>
                    <Input.Search
                        placeholder="Search by type / status / name..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Col>
                <Col xs={24} md={8}>
                    <DatePicker.RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        style={{ width: '100%' }}
                        placeholder={['Due From', 'Due To']}
                    />
                </Col>
                <Col xs={24} md={4}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                        block
                    >
                        Record Payment
                    </Button>
                </Col>
            </Row>

            {/* Refresh Button */}
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                        fetchAllFees();
                        if (selectedStudent) fetchFeesByStudent(selectedStudent);
                    }}
                >
                    Refresh
                </Button>
            </div>

            {/* Transaction table */}
            <h3>Transaction History</h3>
            <Table
                columns={feeColumns}
                dataSource={filteredFees}
                rowKey="_id"
                loading={tableLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} records`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                scroll={{ x: 1100 }}
            />

       

      <Modal
                title="Record New Fee"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleCreateFee} form={form}>
                    <Form.Item
                        name="studentId"
                        label="Student"
                        rules={[{ required: true, message: 'Please select a student' }]}
                    >
                        <Select
                            placeholder="Select student"
                            showSearch
                            optionFilterProp="children"
                        >
                            {students.map((s) => (
                                <Option key={s._id} value={s._id}>
                                    {s.studentName} — {s.rollNo}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="feeType"
                        label="Fee Type"
                        rules={[{ required: true, message: 'Please select fee type' }]}
                    >
                        <Select placeholder="Select fee type">
                            <Option value="Tuition">Tuition</Option>
                            <Option value="Lab">Lab</Option>
                            <Option value="Library">Library</Option>
                            <Option value="Exam">Exam</Option>
                            <Option value="Sports">Sports</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[{ required: true, message: 'Please enter amount' }]}
                    >
                        <Input type="number" prefix="Rs" min={0} step={100} />
                    </Form.Item>

                    <Form.Item
                        name="dueDate"
                        label="Due Date"
                        rules={[{ required: true, message: 'Please select due date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={submitLoading}>
                            Create Fee Record
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Fee Modal */}
            <Modal
                title="Update Fee Record"
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    editForm.resetFields();
                    setEditingFee(null);
                }}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleEditSave} form={editForm}>
                    <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[{ required: true, message: 'Please enter amount' }]}
                    >
                        <Input type="number" prefix="Rs" min={0} step={100} />
                    </Form.Item>

                    <Form.Item
                        name="dueDate"
                        label="Due Date"
                        rules={[{ required: true, message: 'Please select due date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select>
                            <Option value="Pending">Pending</Option>
                            <Option value="Paid">Paid</Option>
                            <Option value="Overdue">Overdue</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={submitLoading}>
                            Update Fee
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Fees;