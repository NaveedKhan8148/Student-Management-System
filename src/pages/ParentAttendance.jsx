import React, { useMemo } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { attendanceData } from '../data/attendance';
import { useChildStudent } from '../hooks/useChildStudent';

const { Title, Text } = Typography;

const ParentAttendance = () => {
    const child = useChildStudent();
    const rows = useMemo(
        () => attendanceData.filter((a) => a.studentId === child?.id),
        [child]
    );

    const totalPresent = rows.filter((r) => r.status === 'Present').length;
    const totalAbsent = rows.filter((r) => r.status === 'Absent').length;
    const totalLate = rows.filter((r) => r.status === 'Late').length;
    const pct = rows.length ? ((totalPresent + totalLate) / rows.length) * 100 : 0;

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Subject', dataIndex: 'subject', key: 'subject' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s) => {
                const color = s === 'Present' ? 'green' : s === 'Absent' ? 'red' : 'orange';
                return <Tag color={color}>{s}</Tag>;
            },
        },
    ];

    if (!child) return <Text type="danger">No linked student.</Text>;

    return (
        <div>
            <Title level={2}>Attendance</Title>
            <Text type="secondary">Read-only — {child.name}</Text>
            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                    <Card className="hover-card">
                        <Statistic title="Attendance %" value={pct} precision={1} suffix="%" prefix={<CheckCircleOutlined />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="hover-card">
                        <Statistic title="Absent" value={totalAbsent} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="hover-card">
                        <Statistic title="Late" value={totalLate} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
                    </Card>
                </Col>
            </Row>
            <Table style={{ marginTop: 24 }} rowKey="key" columns={columns} dataSource={rows} />
        </div>
    );
};

export default ParentAttendance;
