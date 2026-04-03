import React, { useMemo } from 'react';
import { Alert, Card, Col, List, Row, Typography } from 'antd';
import dayjs from 'dayjs';
import { attendanceData } from '../data/attendance';
import { feesData } from '../data/fees';
import { resultsData } from '../data/results';
import { academicWarningsData } from '../data/warnings';
import { useChildStudent } from '../hooks/useChildStudent';

const { Title, Text } = Typography;

function buildAlerts(childId) {
    const alerts = [];
    const records = attendanceData.filter((a) => a.studentId === childId);
    const presentLike = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const pct = records.length ? (presentLike / records.length) * 100 : 100;
    if (pct < 75) {
        alerts.push({
            type: 'warning',
            title: 'Attendance below threshold',
            description: `Overall attendance is about ${pct.toFixed(0)}% (rule: below 75%).`,
        });
    }

    feesData
        .filter((f) => f.studentId === childId && f.status === 'Pending' && f.dueDate)
        .forEach((f) => {
            if (dayjs().isAfter(dayjs(f.dueDate), 'day')) {
                alerts.push({
                    type: 'error',
                    title: 'Fee overdue',
                    description: `${f.type} ($${f.amount}) was due on ${f.dueDate}.`,
                });
            }
        });

    const marks = resultsData.filter((r) => r.studentId === childId);
    const avg =
        marks.length > 0 ? marks.reduce((a, b) => a + b.marks, 0) / marks.length : null;
    if (avg !== null && avg < 60) {
        alerts.push({
            type: 'warning',
            title: 'Academic performance concern',
            description: `Average marks are around ${avg.toFixed(0)}%.`,
        });
    }

    academicWarningsData
        .filter((w) => w.studentId === childId)
        .forEach((w) => {
            alerts.push({
                type: 'error',
                title: w.rule,
                description: w.detail,
            });
        });

    return alerts;
}

const ParentOverview = () => {
    const child = useChildStudent();

    const alerts = useMemo(() => (child ? buildAlerts(child.id) : []), [child]);

    if (!child) {
        return <Text type="danger">No linked student record.</Text>;
    }

    return (
        <div>
            <Title level={2}>Parent dashboard</Title>
            <Text type="secondary">
                Read-only view for <strong>{child.name}</strong> ({child.rollNumber}) — {child.program}
            </Text>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={14}>
                    <Card className="hover-card" title="Automatic alerts">
                        {alerts.length === 0 ? (
                            <Alert type="success" message="No active alerts based on current static data." showIcon />
                        ) : (
                            <List
                                dataSource={alerts}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Alert type={item.type} message={item.title} description={item.description} showIcon />
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card className="hover-card" title="Transparency & accountability">
                        <p style={{ margin: 0, color: '#595959' }}>
                            This module mirrors institutional data (attendance, results, fees, timetable) so parents can
                            collaborate with the school without editing records.
                        </p>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ParentOverview;
