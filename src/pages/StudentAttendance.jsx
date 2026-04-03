import React, { useState, useEffect } from 'react';
import { Table, Card, Statistic, Row, Col, Tag, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { attendanceData } from '../data/attendance';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const StudentAttendance = () => {
    const { user } = useAuth();
    const [myAttendance, setMyAttendance] = useState([]);

    useEffect(() => {
        if (user && user.studentId) {
            const filtered = attendanceData.filter(record => record.studentId === user.studentId);
            setMyAttendance(filtered);
        }
    }, [user]);

    const normalizedAttendance = myAttendance.map((r) => ({
        ...r,
        status: r.status === 'Late' ? 'Absent' : r.status,
    }));

    const totalPresent = normalizedAttendance.filter(r => r.status === 'Present').length;
    const totalAbsent = normalizedAttendance.filter(r => r.status === 'Absent').length;
    const attendancePercentage = normalizedAttendance.length > 0
        ? (totalPresent / normalizedAttendance.length) * 100
        : 0;

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const color = status === 'Absent' ? 'red' : 'green';
                return <Tag color={color}>{status}</Tag>;
            },
        },
    ];

    return (
        <div>
            <Title level={2}>My Attendance</Title>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card className="hover-card">
                        <Statistic
                            title="Attendance %"
                            value={attendancePercentage}
                            precision={1}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<CheckCircleOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="hover-card">
                        <Statistic
                            title="Total Absent"
                            value={totalAbsent}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="hover-card">
                        <Statistic
                            title="Total Absent"
                            value={totalAbsent}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Table columns={columns} dataSource={normalizedAttendance} rowKey="key" />
        </div>
    );
};

export default StudentAttendance;
