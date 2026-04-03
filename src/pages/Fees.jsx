import React, { useState } from 'react';
import { Table, Button, Card, Statistic, Row, Col, Tag, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, DollarOutlined, HistoryOutlined, PrinterOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { feesData as initialData, feeStructures } from '../data/fees';

const { Option } = Select;

const Fees = () => {
    const [fees, setFees] = useState(initialData);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);

    // Calculate totals
    const totalCollected = fees.reduce((acc, curr) => curr.status === 'Paid' ? acc + curr.amount : acc, 0);
    const totalPending = fees.reduce((acc, curr) => curr.status === 'Pending' ? acc + curr.amount : acc, 0);

    const generateReceipt = (record) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Fee Receipt', 105, 20, null, null, 'center');

        doc.setFontSize(12);
        doc.text(`Transaction ID: ${record.transactionId}`, 20, 40);
        doc.text(`Student Name: ${record.studentName}`, 20, 50);
        doc.text(`Date: ${record.date}`, 20, 60);

        autoTable(doc, {
            startY: 70,
            head: [['Fee Type', 'Amount', 'Status']],
            body: [
                [record.type, `Rs ${record.amount}`, record.status],
            ],
        });

        doc.text('Thank you for your payment!', 105, doc.lastAutoTable.finalY + 20, null, null, 'center');

        doc.save(`Receipt_${record.transactionId}.pdf`);
        message.success('Receipt downloaded');
    };

    const columns = [
        {
            title: 'Transaction ID',
            dataIndex: 'transactionId',
            key: 'transactionId',
        },
        {
            title: 'Student Name',
            dataIndex: 'studentName',
            key: 'studentName',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `Rs ${amount}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Paid' ? 'green' : 'orange'}>{status}</Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button icon={<PrinterOutlined />} size="small" onClick={() => generateReceipt(record)}>Receipt</Button>
            ),
        },
    ];

    const handleRecordPayment = (values) => {
        const newTransaction = {
            key: String(fees.length + 1),
            transactionId: `TXN00${fees.length + 1}`,
            studentId: 'STU001', // Mocking student ID for now
            studentName: values.studentName,
            amount: Number(values.amount),
            type: values.type,
            status: 'Paid',
            date: values.date.format('YYYY-MM-DD'),
        };
        setFees([newTransaction, ...fees]);
        setIsModalVisible(false);
        form.resetFields();
        message.success('Payment recorded successfully');
    };

    const structureColumns = [
        { title: 'Fee item', dataIndex: 'name', key: 'name' },
        { title: 'Program', dataIndex: 'program', key: 'program' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (a) => `Rs ${a}` },
    ];

    const filteredFees = fees.filter(record => {
        const keyword = searchText.trim().toLowerCase();
        const matchesText = !keyword || [record.transactionId, record.studentName, record.type, record.status]
            .some(f => f?.toString().toLowerCase().includes(keyword));

        const matchesDate = !dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1]
            ? true
            : (record.date >= dateRange[0].format('YYYY-MM-DD') && record.date <= dateRange[1].format('YYYY-MM-DD'));

        return matchesText && matchesDate;
    });

    return (
        <div>
            <h2>Fee structures</h2>
            <Table
                style={{ marginBottom: 24 }}
                columns={structureColumns}
                dataSource={feeStructures}
                rowKey="key"
                pagination={false}
                size="small"
            />
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card className="hover-card">
                        <Statistic
                            title="Total Collected"
                            value={totalCollected}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix="Rs"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="hover-card">
                        <Statistic
                            title="Pending Dues"
                            value={totalPending}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix="Rs"
                        />
                    </Card>
                </Col>
            </Row>

            <h2>Transaction History</h2>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Record Payment
                </Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Input.Search
                        placeholder="Search by TXN ID / name / type / status"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={(value) => setSearchText(value)}
                    />
                </Col>
                <Col xs={24} md={12}>
                    <DatePicker.RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        style={{ width: '100%' }}
                    />
                </Col>
            </Row>

            <Table columns={columns} dataSource={filteredFees} />

            <Modal
                title="Record New Payment"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleRecordPayment} form={form}>
                    <Form.Item
                        name="studentName"
                        label="Student Name"
                        rules={[{ required: true, message: 'Please enter student name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Fee Type"
                        rules={[{ required: true, message: 'Please select fee type' }]}
                    >
                        <Select>
                            <Option value="Tuition Fee">Tuition Fee</Option>
                            <Option value="Library Fee">Library Fee</Option>
                            <Option value="Exam Fee">Exam Fee</Option>
                            <Option value="Transport Fee">Transport Fee</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[{ required: true, message: 'Please enter amount' }]}
                    >
                        <Input type="number" prefix="Rs" />
                    </Form.Item>
                    <Form.Item
                        name="date"
                        label="Payment Date"
                        rules={[{ required: true, message: 'Please select date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Record Payment
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Fees;
