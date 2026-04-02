import React from 'react';
import { Card, Descriptions, Typography } from 'antd';
import { studentsData } from '../data/students';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const StudentProfile = () => {
    const { user } = useAuth();
    const me = studentsData.find((s) => s.id === user?.studentId);

    if (!me) {
        return <Text type="danger">Profile not found.</Text>;
    }

    return (
        <div>
            <Title level={2}>My profile</Title>
            <Text type="secondary">Read-only. Changes are made by administrators only.</Text>
            <Card style={{ marginTop: 16 }}>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Full name">{me.name}</Descriptions.Item>
                    <Descriptions.Item label="Roll number">{me.rollNumber}</Descriptions.Item>
                    <Descriptions.Item label="Student ID">{me.id}</Descriptions.Item>
                    <Descriptions.Item label="Program">{me.program}</Descriptions.Item>
                    <Descriptions.Item label="Class">{me.classLabel}</Descriptions.Item>
                    <Descriptions.Item label="Enrollment">{me.enrollmentDate}</Descriptions.Item>
                    <Descriptions.Item label="Status">{me.status}</Descriptions.Item>
                    <Descriptions.Item label="Contact">{me.contact}</Descriptions.Item>
                    <Descriptions.Item label="Email">{me.email}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default StudentProfile;
