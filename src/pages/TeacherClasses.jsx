import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Space, Typography } from 'antd';
import { teacherClassCards } from '../data/teacherClassCards';

const { Title, Paragraph } = Typography;

const TeacherClasses = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 8 }}>
                    Class dashboard
                </Title>
                <Paragraph type="secondary" style={{ maxWidth: 560 }}>
                    Select a class to view attendance, results, and timetable details. The cards show a quick summary of the class size and attendance snapshot.
                </Paragraph>
            </div>

            <Row gutter={[20, 20]}>
                {teacherClassCards.map((cls) => (
                    <Col key={cls.key} xs={24} sm={12} md={12} lg={8} xl={6}>
                        <Card
                            hoverable
                            onClick={() => navigate(`/teacher/classes/${cls.key}/attendance`)}
                            bodyStyle={{ padding: 20 }}
                            style={{
                                borderRadius: 18,
                                boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                                minHeight: 200,
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                            headStyle={{
                                background: '#fafafa',
                                borderBottom: '1px solid #f0f0f0',
                                borderRadius: '18px 18px 0 0',
                            }}
                            title={
                                <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: 0.3 }}>
                                    {cls.label}
                                </div>
                            }
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Row gutter={12} style={{ textAlign: 'center' }}>
                                    <Col span={8}>
                                        <div style={{ color: '#8c8c8c', fontSize: 12 }}>Total</div>
                                        <div style={{ fontSize: 20, fontWeight: 700 }}>{cls.total}</div>
                                    </Col>
                                    <Col span={8}>
                                        <div style={{ color: '#8c8c8c', fontSize: 12 }}>Present</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#389e0d' }}>{cls.present}</div>
                                    </Col>
                                    <Col span={8}>
                                        <div style={{ color: '#8c8c8c', fontSize: 12 }}>Absent</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#cf1322' }}>{cls.absent}</div>
                                    </Col>
                                </Row>

                                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                    Tap to open the attendance and results workflow for this class.
                                </Paragraph>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default TeacherClasses;

