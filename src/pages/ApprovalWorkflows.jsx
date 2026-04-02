import React, { useState } from 'react';
import { Table, Tag, Typography, Button, Space } from 'antd';
import { approvalRequestsData as initial } from '../data/workflows';

const { Title, Text } = Typography;

const ApprovalWorkflows = () => {
    const [rows, setRows] = useState(initial);

    const updateStatus = (key, status) => {
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, status } : r)));
    };

    const columns = [
        { title: 'Type', dataIndex: 'type', key: 'type' },
        { title: 'Requester', dataIndex: 'requesterName', key: 'requesterName' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        { title: 'Submitted', dataIndex: 'submittedAt', key: 'submittedAt' },
        {
            title: 'Chain',
            dataIndex: 'chain',
            key: 'chain',
            render: (chain) => chain.join(' → '),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s) => {
                const color = s === 'Approved' ? 'green' : s === 'Rejected' ? 'red' : 'gold';
                return <Tag color={color}>{s}</Tag>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) =>
                record.status === 'Pending' ? (
                    <Space>
                        <Button size="small" type="primary" onClick={() => updateStatus(record.key, 'Approved')}>
                            Approve
                        </Button>
                        <Button size="small" danger onClick={() => updateStatus(record.key, 'Rejected')}>
                            Reject
                        </Button>
                    </Space>
                ) : (
                    <Text type="secondary">—</Text>
                ),
        },
    ];

    return (
        <div>
            <Title level={2}>Digital approval workflows</Title>
            <Text type="secondary">
                Fee concessions, result corrections, attendance adjustments — status updates are stored in this session
                only (static demo).
            </Text>
            <Table style={{ marginTop: 16 }} rowKey="key" columns={columns} dataSource={rows} />
        </div>
    );
};

export default ApprovalWorkflows;
