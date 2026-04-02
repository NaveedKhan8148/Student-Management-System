import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
    TeamOutlined,
    DollarOutlined,
    CalendarOutlined,
    FileDoneOutlined,
    LogoutOutlined,
    WarningOutlined,
    AuditOutlined,
    ReadOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenu = [
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    const items = [
        { key: '/dashboard', icon: <DashboardOutlined />, label: 'Analytics dashboard' },
        { key: '/students', icon: <TeamOutlined />, label: 'Students' },
        { key: '/attendance', icon: <FileDoneOutlined />, label: 'Attendance' },
        { key: '/fees', icon: <DollarOutlined />, label: 'Fees' },
        { key: '/timetable', icon: <CalendarOutlined />, label: 'Timetable' },
        { key: '/results', icon: <ReadOutlined />, label: 'Results' },
        { key: '/warnings', icon: <WarningOutlined />, label: 'Academic warnings' },
        { key: '/approvals', icon: <AuditOutlined />, label: 'Approval workflows' },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div
                    style={{
                        margin: 16,
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 13,
                    }}
                >
                    {user?.username || 'Admin'}
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
                            <span>{user?.username || 'Admin'}</span>
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

export default MainLayout;
