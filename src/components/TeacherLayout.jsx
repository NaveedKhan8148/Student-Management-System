import React, { useMemo, useState } from 'react';
import {
    Layout,
    Menu,
    Button,
    theme,
    Avatar,
    Dropdown,
    Space,
    Typography,
} from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    DashboardOutlined,
    FileDoneOutlined,
    ReadOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const TeacherLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const navigate = useNavigate();
    const location = useLocation();
    const { classKey } = useParams();
    const { user, logout } = useAuth();

    const isClassScreen = Boolean(classKey);
    const base = classKey ? `/teacher/classes/${classKey}` : '/teacher';

    const userMenu = useMemo(
        () => [
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                onClick: () => {
                    logout();
                    navigate('/login');
                },
            },
        ],
        [logout, navigate]
    );

    const items = useMemo(() => {
        const homeKey = '/teacher/attendance';

        if (!isClassScreen) {
            return [
                {
                    key: homeKey,
                    icon: <DashboardOutlined />,
                    label: 'Home',
                },
            ];
        }

        return [
            {
                key: homeKey,
                icon: <DashboardOutlined />,
                label: 'Back to main',
            },
            {
                key: `${base}/attendance`,
                icon: <FileDoneOutlined />,
                label: 'Attendance',
            },
            {
                key: `${base}/results`,
                icon: <ReadOutlined />,
                label: 'Results',
            },
            {
                key: `${base}/timetable`,
                icon: <CalendarOutlined />,
                label: 'TimeTable',
            },
        ];
    }, [base, isClassScreen]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div
                    style={{
                        margin: 16,
                        padding: '12px 14px',
                        background: 'rgba(255, 255, 255, 0.12)',
                        borderRadius: 8,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
                    }}
                >
                    {user?.username || 'Teacher'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={items}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: '0 24px 0 0',
                        background: colorBgContainer,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar icon={<UserOutlined />} />
                            <span>{user?.username || 'Teacher'}</span>
                        </Space>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default TeacherLayout;
