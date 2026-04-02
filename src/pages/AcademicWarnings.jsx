import React from 'react';
import { Table, Tag, Typography } from 'antd';
import { academicWarningsData } from '../data/warnings';

const { Title, Text } = Typography;

const AcademicWarnings = () => {
    const columns = [
        { title: 'Student', dataIndex: 'studentName', key: 'studentName' },
        { title: 'ID', dataIndex: 'studentId', key: 'studentId' },
        { title: 'Program', dataIndex: 'program', key: 'program' },
        { title: 'Class', dataIndex: 'classLabel', key: 'classLabel' },
        { title: 'Rule', dataIndex: 'rule', key: 'rule' },
        { title: 'Detail', dataIndex: 'detail', key: 'detail' },
        {
            title: 'Severity',
            dataIndex: 'severity',
            key: 'severity',
            render: (s) => <Tag color={s === 'high' ? 'red' : 'orange'}>{s}</Tag>,
        },
    ];

    return (
        <div>
            <Title level={2}>Rule-based academic warnings</Title>
            <Text type="secondary">
                Students flagged by predefined rules (attendance, failures, trends). Teachers see a filtered list under
                their portal.
            </Text>
            <Table style={{ marginTop: 16 }} rowKey="key" columns={columns} dataSource={academicWarningsData} />
        </div>
    );
};

export default AcademicWarnings;
