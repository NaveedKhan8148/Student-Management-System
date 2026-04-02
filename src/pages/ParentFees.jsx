import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography } from 'antd';
import { DollarOutlined, HistoryOutlined } from '@ant-design/icons';
import { feesData } from '../data/fees';
import { useChildStudent } from '../hooks/useChildStudent';

const { Title, Text } = Typography;

const ParentFees = () => {
    const child = useChildStudent();
    const rows = useMemo(() => feesData.filter((f) => f.studentId === child?.id), [child]);

    const paid = rows.reduce((a, c) => (c.status === 'Paid' ? a + c.amount : a), 0);
    const pending = rows.reduce((a, c) => (c.status === 'Pending' ? a + c.amount : a), 0);

    const columns = [
        { title: 'Transaction', dataIndex: 'transactionId', key: 'transactionId' },
        { title: 'Type', dataIndex: 'type', key: 'type' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (n) => `$${n}` },
        { title: 'Due', dataIndex: 'dueDate', key: 'dueDate' },
        { title: 'Paid on', dataIndex: 'date', key: 'date', render: (d) => d || '—' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s) => <Tag color={s === 'Paid' ? 'green' : 'orange'}>{s}</Tag>,
        },
    ];

    if (!child) return <Text type="danger">No linked student.</Text>;

    return (
        <div>
            <Title level={2}>Fee status</Title>
            <Text type="secondary">Read-only — dues and payments</Text>
            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                    <Card>
                        <Statistic title="Total paid" value={paid} prefix={<DollarOutlined />} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Statistic title="Pending" value={pending} prefix={<HistoryOutlined />} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
            </Row>
            <Table style={{ marginTop: 24 }} rowKey="key" columns={columns} dataSource={rows} />
        </div>
    );
};

export default ParentFees;
