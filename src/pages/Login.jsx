import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const { Title } = Typography;

const homePath = (role) => {
    switch (role?.toLowerCase()) {
        case 'admin':
            return '/dashboard';
        case 'teacher':
            return '/teacher/attendance';
        case 'parent':
            return '/parent/overview';
        case 'student':
            return '/student/timetable';
        default:
            return '/login';
    }
};

const Login = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname;
    const [jokes, setJokes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Redirect already-logged-in users away from login page
    useEffect(() => {
        if (user) {
            const dest = from && from !== '/login' ? from : homePath(user.role);
            navigate(dest, { replace: true });
        }
    }, [user, from, navigate]);

    useEffect(() => {
        axios.get("/api/v1/jokes")
            .then((res) => setJokes(res.data))
            .catch((err) => console.log(err));
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        const result = await login(values.username, values.password);
        
        if (result.ok) {
            message.success('Login successful');
            const dest = from && from !== '/login' ? from : homePath(result.role);
            navigate(dest, { replace: true });
        } else {
            message.error(result.message || 'Invalid username or password');
        }
        setLoading(false);
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f0f2f5',
                padding: 24,
            }}
        >
            <Card style={{ width: 400, maxWidth: '100%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ marginBottom: 8 }}>
                        Education Automation System
                    </Title>
                    <p style={{ color: '#666', margin: 0 }}>Sign in to continue</p>
                    {jokes.length > 0 && (
                        <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                            Jokes available: {jokes.length}
                        </p>
                    )}
                </div>
                <Form name="login" onFinish={onFinish} size="large">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please enter your email' }]}
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