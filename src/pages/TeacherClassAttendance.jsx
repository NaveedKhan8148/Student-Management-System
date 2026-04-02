import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Row, Space, Statistic, Table, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { getTeacherClassCard } from '../data/teacherClassCards';
import { getStudentsForTeacherClass } from '../data/teacherClassStudents';

const { Text, Title } = Typography;

const TeacherClassAttendance = () => {
    const { classKey } = useParams();
    const cls = useMemo(() => getTeacherClassCard(classKey), [classKey]);
    const students = useMemo(() => getStudentsForTeacherClass(classKey), [classKey]);

    const [statusByRoll, setStatusByRoll] = useState(() => {
        const init = {};
        students.forEach((s) => {
            init[s.rollNo] = 'present';
        });
        return init;
    });

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
            else if (st === 'late') acc.late += 1;
            return acc;
        },
        { present: 0, absent: 0, late: 0 }
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
            title: 'student Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Actione',
            key: 'action',
            render: (_, record) => (
                <Space size={10}>
                    <Button
                        size="small"
                        type={statusByRoll[record.rollNo] === 'present' ? 'primary' : 'default'}
                        onClick={() => handleSetStatus(record.rollNo, 'present')}
                    >
                        present
                    </Button>
                    <Button
                        size="small"
                        type={statusByRoll[record.rollNo] === 'late' ? 'primary' : 'default'}
                        onClick={() => handleSetStatus(record.rollNo, 'late')}
                    >
                        late
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
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                    <Card style={{ border: '3px solid #000', borderRadius: 2 }}>
                        <Statistic title="Total Studentd" value={students.length || cls.total} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card style={{ border: '3px solid #000', borderRadius: 2 }}>
                        <div style={{ paddingTop: 8 }}>
                            <div style={{ fontWeight: 600 }}>Present Student {totals.present}</div>
                            <div style={{ fontWeight: 600 }}>Absent Student {totals.absent}</div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card style={{ border: '3px solid #000', borderRadius: 2 }}>
                <Title level={4} style={{ marginTop: 0, textAlign: 'center' }}>
                    {cls.label} Students
                </Title>
                <Table
                    rowKey="key"
                    columns={columns}
                    dataSource={students}
                    pagination={false}
                    bordered
                />
            </Card>

            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                Buttons update values in this session only (static demo; no backend).
            </Text>
        </div>
    );
};

export default TeacherClassAttendance;

