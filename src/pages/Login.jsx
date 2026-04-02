import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const homePath = (role) => {
    switch (role) {
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

    React.useEffect(() => {
        if (user) {
            const dest = from && from !== '/login' ? from : homePath(user.role);
            navigate(dest, { replace: true });
        }
    }, [user, navigate, from]);

    const onFinish = (values) => {
        const res = login(values.username, values.password);
        if (res.ok) {
            message.success('Login successful');
        } else {
            message.error('Invalid username or password');
        }
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
                    <p style={{ color: '#666', margin: 0 }}>Sign in (demo — static data, no server)</p>
                </div>
                <Form name="login" onFinish={onFinish} size="large">
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Enter email or username' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email or username" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Enter password' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.8 }}>
                    <strong>Demo accounts</strong>
                    <br />
                    Admin: admin / admin
                    <br />
                    Teacher: teacher@school.edu / teacher123
                    <br />
                    Parent (John&apos;s): parent.john@example.com / parent123
                    <br />
                    Student: john.doe@example.com / 123456
                </div>
            </Card>
        </div>
    );
};

export default Login;
