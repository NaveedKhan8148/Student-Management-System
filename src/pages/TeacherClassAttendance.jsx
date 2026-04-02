import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Input, Row, Space, Statistic, Table, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { getTeacherClassCard } from '../data/teacherClassCards';
import { getStudentsForTeacherClass } from '../data/teacherClassStudents';

const { Text, Title } = Typography;

const TeacherClassAttendance = () => {
    const { classKey } = useParams();
    const cls = useMemo(() => getTeacherClassCard(classKey), [classKey]);
    const students = useMemo(() => getStudentsForTeacherClass(classKey), [classKey]);

    const today = useMemo(() => new Date(), []);
    const todayLabel = today.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });

    const [statusByRoll, setStatusByRoll] = useState(() => {
        const init = {};
        students.forEach((s) => {
            init[s.rollNo] = 'present';
        });
        return init;
    });
    const [searchText, setSearchText] = useState('');
    const filteredStudents = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        if (!query) return students;
        return students.filter((student) =>
            student.name.toLowerCase().includes(query) ||
            student.rollNo.toLowerCase().includes(query)
        );
    }, [searchText, students]);

    if (!cls) {
        return (
            <Typography.Text type="danger">
                Unknown class.
            </Typography.Text>
        );
    }

    const totals = students.reduce(
        (acc, s) => {
            const st = statusByRoll[s.rollNo] || 'present';
            if (st === 'present') acc.present += 1;
            else if (st === 'absent') acc.absent += 1;
            return acc;
        },
        { present: 0, absent: 0 }
    );

    const handleSetStatus = (rollNo, status) => {
        setStatusByRoll((prev) => ({ ...prev, [rollNo]: status }));
    };

    const columns = [
        {
            title: 'Roll No',
            dataIndex: 'rollNo',
            key: 'rollNo',
            width: 120,
        },
        {
            title: 'Student Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Date',
            key: 'date',
            width: 160,
            render: () => todayLabel,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size={10} wrap>
                    <Button
                        size="small"
                        type={statusByRoll[record.rollNo] === 'present' ? 'primary' : 'default'}
                        onClick={() => handleSetStatus(record.rollNo, 'present')}
                    >
                        present
                    </Button>
                    <Button
                        size="small"
                        danger={statusByRoll[record.rollNo] === 'absent'}
                        type={statusByRoll[record.rollNo] === 'absent' ? 'primary' : 'default'}
                        onClick={() => handleSetStatus(record.rollNo, 'absent')}
                    >
                        absent
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={8}>
                    <Card className="hover-card" style={{ borderRadius: 12, minHeight: 120 }}>
                        <Statistic title="Total Students" value={students.length || cls.total} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="hover-card" style={{ borderRadius: 12, minHeight: 120 }}>
                        <Statistic title="Present" value={totals.present} valueStyle={{ color: '#389e0d' }} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card className="hover-card" style={{ borderRadius: 12, minHeight: 120 }}>
                        <Statistic title="Absent" value={totals.absent} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
            </Row>

            <Card className="hover-card" style={{ borderRadius: 14, padding: 20 }}>
                <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0, flex: '1 1 320px' }}>
                        <Title level={4} style={{ marginBottom: 4 }}>
                            {cls.label} Students
                        </Title>
                        <Text type="secondary">Attendance for today only.</Text>
                    </div>
                    <div style={{ minWidth: 260, marginTop: 12 }}>
                        <Input
                            placeholder="Search by roll or student name"
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap', marginTop: 12 }}>
                        <Text strong>Attendance date</Text>
                        <br />
                        <Text>{todayLabel}</Text>
                    </div>
                </div>

                <Table
                    rowKey="key"
                    columns={columns}
                    dataSource={filteredStudents}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Card>

            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                Attendance may only be recorded for the current day. Past attendance is not editable in this demo.
            </Text>
        </div>
    );
};

export default TeacherClassAttendance;

