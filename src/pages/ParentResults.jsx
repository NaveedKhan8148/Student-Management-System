import React, { useMemo } from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import { resultsData } from '../data/results';
import { useChildStudent } from '../hooks/useChildStudent';

const { Title, Text } = Typography;

const ParentResults = () => {
    const child = useChildStudent();
    const rows = useMemo(() => resultsData.filter((r) => r.studentId === child?.id), [child]);

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

    if (!child) return <Text type="danger">No linked student.</Text>;

    return (
        <div>
            <Title level={2}>Results & grades</Title>
            <Text type="secondary">Read-only — {child.name}</Text>
            <Card style={{ marginTop: 16 }}>
                <Table rowKey="key" columns={columns} dataSource={rows} pagination={false} />
            </Card>
        </div>
    );
};

export default ParentResults;
