import React, { useMemo } from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import { resultsData } from '../data/results';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const StudentResults = () => {
    const { user } = useAuth();
    const rows = useMemo(
        () => resultsData.filter((r) => r.studentId === user?.studentId),
        [user]
    );

    const columns = [
        { title: 'Subject', dataIndex: 'subject', key: 'subject' },
        { title: 'Marks', dataIndex: 'marks', key: 'marks' },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (g) => <Tag color={g === 'F' ? 'red' : 'blue'}>{g}</Tag>,
        },
        { title: 'Term', dataIndex: 'term', key: 'term' },
    ];

    return (
        <div>
            <Title level={2}>My results & grades</Title>
            <Text type="secondary">View only — contact admin for corrections (use approval workflow).</Text>
            <Card style={{ marginTop: 16 }}>
                <Table rowKey="key" columns={columns} dataSource={rows} pagination={false} />
            </Card>
        </div>
    );
};

export default StudentResults;
