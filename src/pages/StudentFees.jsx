import React, { useState, useEffect } from 'react';
import { Table, Card, Statistic, Row, Col, Tag, Typography, Button, message } from 'antd';
import { DollarOutlined, HistoryOutlined, PrinterOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { feesData } from '../data/fees';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const StudentFees = () => {
    const { user } = useAuth();
    const [myFees, setMyFees] = useState([]);

    useEffect(() => {
        if (user && user.studentId) {
            const filtered = feesData.filter(record => record.studentId === user.studentId);
            setMyFees(filtered);
        }
    }, [user]);

    const totalPaid = myFees.reduce((acc, curr) => curr.status === 'Paid' ? acc + curr.amount : acc, 0);
    const totalPending = myFees.reduce((acc, curr) => curr.status === 'Pending' ? acc + curr.amount : acc, 0);

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
                [record.type, `$${record.amount}`, record.status],
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
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${amount}`,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
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
                record.status === 'Paid' ?
                    <Button icon={<PrinterOutlined />} size="small" onClick={() => generateReceipt(record)}>Receipt</Button> : null
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>My Fees</Title>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Total Paid"
                            value={totalPaid}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Pending Dues"
                            value={totalPending}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<HistoryOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Table columns={columns} dataSource={myFees} rowKey="key" />
        </div>
    );
};

export default StudentFees;
