import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Space, Typography, Spin, message } from 'antd';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;

const TeacherClasses = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [classes, setClasses] = useState([]);
    const [studentCounts, setStudentCounts] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchClasses(); }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/classes/');
            const all = res.data.data;
            setClasses(all);
            fetchStudentCounts(all);
        } catch {
            message.error('Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentCounts = async (classList) => {
        const results = await Promise.all(
            classList.map((cls) =>
                axios.get(`/api/v1/students/class/${cls._id}`)
                    .then((r) => ({ id: cls._id, count: r.data.data.length }))
                    .catch(() => ({ id: cls._id, count: 0 }))
            )
        );
        const map = {};
        results.forEach(({ id, count }) => { map[id] = count; });
        setStudentCounts(map);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
    }

    return (
        <div style={{ padding: '24px 0' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 8 }}>Class Dashboard</Title>
                <Paragraph type="secondary" style={{ maxWidth: 560 }}>
                    Select a class to view attendance, results and timetable.
                </Paragraph>
                {profile && (
                    <Paragraph type="secondary">
                        Teacher: <strong>{profile.name}</strong> — {profile.subject}
                    </Paragraph>
                )}
            </div>

            <Row gutter={[20, 20]}>
                {classes.map((cls) => (
                    <Col key={cls._id} xs={24} sm={12} md={12} lg={8} xl={6}>
                        <Card
                            hoverable
                            className="hover-card"
                            onClick={() => navigate(`/teacher/classes/${cls._id}/attendance`)}
                            bodyStyle={{ padding: 20 }}
                            style={{ borderRadius: 18, boxShadow: '0 12px 24px rgba(0,0,0,0.08)', minHeight: 200 }}
                            headStyle={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', borderRadius: '18px 18px 0 0' }}
                            title={<div style={{ fontWeight: 700, fontSize: 18 }}>{cls.name}</div>}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Row gutter={12} style={{ textAlign: 'center' }}>
                                    <Col span={12}>
                                        <div style={{ color: '#8c8c8c', fontSize: 12 }}>Students</div>
                                        <div style={{ fontSize: 20, fontWeight: 700 }}>
                                            {studentCounts[cls._id] ?? '...'}
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div style={{ color: '#8c8c8c', fontSize: 12 }}>Class Teacher</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1890ff' }}>
                                            {cls.classTeacherId?.name || '—'}
                                        </div>
                                    </Col>
                                </Row>
                                <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 12 }}>
                                    Tap to open attendance and results for this class.
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
