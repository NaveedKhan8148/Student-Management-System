import React, { useMemo } from 'react';
import { Table, Typography, Tag } from 'antd';
import { academicWarningsData } from '../data/warnings';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const TeacherWarnings = () => {
    const { user } = useAuth();

    const data = useMemo(
        () => academicWarningsData.filter((w) => w.teacherId === user?.teacherId),
        [user]
    );

    const columns = [
        { title: 'Student', dataIndex: 'studentName', key: 'studentName' },
        { title: 'Program', dataIndex: 'program', key: 'program' },
        { title: 'Class', dataIndex: 'classLabel', key: 'classLabel' },
        {
            title: 'Rule triggered',
            dataIndex: 'rule',
            key: 'rule',
        },
        { title: 'Detail', dataIndex: 'detail', key: 'detail' },
        {
            title: 'Severity',
            dataIndex: 'severity',
            key: 'severity',
            render: (s) => (
                <Tag color={s === 'high' ? 'red' : 'orange'}>{s}</Tag>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Academic warnings (assigned classes)</Title>
            <Text type="secondary">
                Rule-based flags (attendance, multiple failures, declining trends). No AI — static demo data.
            </Text>
            <Table style={{ marginTop: 16 }} rowKey="key" columns={columns} dataSource={data} />
        </div>
    );
};

export default TeacherWarnings;
