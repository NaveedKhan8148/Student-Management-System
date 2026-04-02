import React, { useMemo } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { getTeacherClassCard } from '../data/teacherClassCards';

const { Text } = Typography;

const TeacherClassAttendance = () => {
    const { classKey } = useParams();
    const cls = useMemo(() => getTeacherClassCard(classKey), [classKey]);

    if (!cls) {
        return (
            <Typography.Text type="danger">
                Unknown class.
            </Typography.Text>
        );
    }

    return (
        <div>
            <Row gutter={16}>
                <Col span={12}>
                    <Card style={{ border: '3px solid #000', borderRadius: 2 }}>
                        <Statistic title="Total students" value={cls.total} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card style={{ border: '3px solid #000', borderRadius: 2 }}>
                        <Statistic
                            title="present student"
                            value={cls.present}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={24}>
                    <Card
                        style={{
                            border: '3px solid #000',
                            borderRadius: 2,
                            marginTop: 16,
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ padding: 18 }}>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>
                                Absent student
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 700 }}>
                                {cls.absent.toString().padStart(2, '0')}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                Snapshot is static demo data (no backend).
            </Text>
        </div>
    );
};

export default TeacherClassAttendance;

