import React from 'react';
import { Card, Descriptions, Typography, Spin, Tag, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const StudentProfile = () => {
    const { profile, loading, user } = useAuth();

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!profile) {
        return <Text type="danger">Profile not found.</Text>;
    }

    return (
        <div>
            <Title level={2}>My Profile</Title>
            <Text type="secondary">Read-only. Changes are made by administrators only.</Text>

            {/* ── Avatar + name banner ── */}
            <Card style={{ marginTop: 16, marginBottom: 16, textAlign: 'center' }}>
                <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff', marginBottom: 12 }}
                />
                <div style={{ fontSize: 20, fontWeight: 700 }}>{profile.studentName}</div>
                <div style={{ color: '#8c8c8c' }}>{profile.rollNo}</div>
                <Tag
                    color={user?.status === 'ACTIVE' ? 'green' : 'red'}
                    style={{ marginTop: 8 }}
                >
                    {user?.status || 'ACTIVE'}
                </Tag>
            </Card>

            {/* ── Details ── */}
            <Card>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Full Name">
                        {profile.studentName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Roll Number">
                        {profile.rollNo}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {profile.userId?.email || user?.email || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Class">
                        {profile.classId?.name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date of Joining">
                        {profile.dateOfJoining
                            ? dayjs(profile.dateOfJoining).format('YYYY-MM-DD')
                            : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address">
                        {profile.address || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Account Status">
                        <Tag color={user?.status === 'ACTIVE' ? 'green' : 'red'}>
                            {user?.status || 'ACTIVE'}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default StudentProfile;
