// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const homePath = (role) => {
    switch (role?.toUpperCase()) {
        case 'ADMIN':   return '/dashboard';
        case 'TEACHER': return '/teacher/classes';
        case 'PARENT':  return '/parent/overview';
        case 'STUDENT': return '/student/timetable';
        default:        return '/login';
    }
};

const Login = () => {
    const { login, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [redirected, setRedirected] = useState(false);

    // Handle redirect when user is authenticated
    useEffect(() => {
        if (!authLoading && user && !redirected) {
            const from = location.state?.from?.pathname;
            const dest = from && from !== '/login' ? from : homePath(user.role);
            setRedirected(true);
            navigate(dest, { replace: true });
        }
    }, [user, authLoading, location, navigate, redirected]);

    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Don't show login form if already logged in
    if (user) {
        return null;
    }

    const onFinish = async (values) => {
        if (loading) return; // Prevent multiple submissions
        
        setLoading(true);
        const result = await login(values.email, values.password);
        
        if (result.ok) {
            message.success('Login successful');
            // Don't navigate here - let useEffect handle it
        } else {
            message.error(result.message || 'Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            padding: 24,
        }}>
            <Card style={{ width: 400, maxWidth: '100%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ marginBottom: 8 }}>
                        Education Automation System
                    </Title>
                    <p style={{ color: '#666', margin: 0 }}>Sign in to continue</p>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    size="large"
                    initialValues={{ email: 'admin@school.edu' }}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.8 }}>
                    <strong>Login with your registered credentials</strong>
                    <br />
                    Use the email and password you registered with
                </div>
            </Card>
        </div>
    );
};

export default Login;