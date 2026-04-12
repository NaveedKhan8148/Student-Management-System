import React, { useState, useEffect } from 'react';
import {
    Table, Card, Statistic, Row, Col, Tag,
    Typography, Button, message, Input,
    DatePicker, Spin
} from 'antd';
import { DollarOutlined, HistoryOutlined, PrinterOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const StudentFees = () => {
    const { profile, loading: authLoading } = useAuth();
    const [fees, setFees] = useState([]);
    const [loadingFees, setLoadingFees] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);

    useEffect(() => {
        if (profile?._id) fetchFees(profile._id);
    }, [profile]);

    const fetchFees = async (studentId) => {
        setLoadingFees(true);
        try {
            const res = await axios.get(`/api/v1/fees/student/${studentId}`);
            setFees(res.data.data);
        } catch {
            // silent
        } finally {
            setLoadingFees(false);
        }
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalPaid = fees
        .filter((f) => f.status === 'Paid')
        .reduce((s, f) => s + Number(f.amount), 0);

    const totalPending = fees
        .filter((f) => f.status === 'Pending' || f.status === 'Overdue')
        .reduce((s, f) => s + Number(f.amount), 0);

    // ── PDF receipt ───────────────────────────────────────────────────────────
    const generateReceipt = (record) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Fee Receipt', 105, 20, null, null, 'center');
        doc.setFontSize(12);
        doc.text(`Student: ${profile?.studentName || '-'}`, 20, 40);
        doc.text(`Roll No: ${profile?.rollNo || '-'}`, 20, 50);
        doc.text(`Fee Type: ${record.feeType}`, 20, 60);
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
            'Thank you for your payment!',
            105, doc.lastAutoTable.finalY + 20,
            null, null, 'center'
        );
        doc.save(`Receipt_${record._id}.pdf`);
        message.success('Receipt downloaded');
    };

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredFees = fees.filter((record) => {
        const search = searchText.trim().toLowerCase();
        const matchText =
            !search ||
            [record.feeType, record.status]
                .some((f) => f?.toString().toLowerCase().includes(search));

        const due = dayjs(record.dueDate).format('YYYY-MM-DD');
        const matchDate =
            !dateRange || !dateRange[0] || !dateRange[1]
                ? true
                : due >= dateRange[0].format('YYYY-MM-DD') &&
                  due <= dateRange[1].format('YYYY-MM-DD');

        return matchText && matchDate;
    });

    // ── Columns (read-only — no edit/delete) ──────────────────────────────────
    const columns = [
        {
            title: 'Fee Type',
            dataIndex: 'feeType',
            key: 'feeType',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (n) => `Rs ${Number(n).toLocaleString()}`,
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '—'),
            sorter: (a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
        },
        {
            title: 'Paid On',
            dataIndex: 'paidDate',
            key: 'paidDate',
            render: (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '—'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s) => (
                <Tag color={
                    s === 'Paid' ? 'green' :
                    s === 'Overdue' ? 'red' :
                    'orange'
                }>
                    {s}
                </Tag>
            ),
            filters: [
                { text: 'Paid',    value: 'Paid'    },
                { text: 'Pending', value: 'Pending' },
                { text: 'Overdue', value: 'Overdue' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Receipt',
            key: 'receipt',
            render: (_, record) =>
                record.status === 'Paid' ? (
                    <Button
                        icon={<PrinterOutlined />}
                        size="small"
                        onClick={() => generateReceipt(record)}
                    >
                        Receipt
                    </Button>
                ) : null,
        },
    ];

    // ── Loading ───────────────────────────────────────────────────────────────
    if (authLoading) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!profile) {
        return <Text type="danger">Profile not found.</Text>;
    }

    return (
        <div>
            <Title level={2}>My Fees</Title>
            <Text type="secondary">
                <strong>{profile.studentName}</strong> ({profile.rollNo}) — view only
            </Text>

            {/* ── Stats ── */}
            <Row gutter={[16, 16]} style={{ marginTop: 16, marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card className="hover-card">
                        <Statistic
                            title="Total Paid"
                            value={totalPaid}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                            formatter={(v) => `Rs ${Number(v).toLocaleString()}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="hover-card">
                        <Statistic
                            title="Pending / Overdue"
                            value={totalPending}
                            prefix={<HistoryOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                            formatter={(v) => `Rs ${Number(v).toLocaleString()}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="hover-card">
                        <Statistic
                            title="Total Records"
                            value={fees.length}
                        />
                    </Card>
                </Col>
            </Row>

            {/* ── Filters ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Input.Search
                        placeholder="Search by fee type or status..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Col>
                <Col xs={24} md={12}>
                    <DatePicker.RangePicker
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        style={{ width: '100%' }}
                        placeholder={['Due From', 'Due To']}
                    />
                </Col>
            </Row>

            {/* ── Table ── */}
            <Title level={4}>Transaction History</Title>
            <Table
                columns={columns}
                dataSource={filteredFees}
                rowKey="_id"
                loading={loadingFees}
                pagination={{
                    pageSize: 10,
                    showTotal: (t) => `Total ${t} records`,
                }}
            />
        </div>
    );
};

export default StudentFees;
