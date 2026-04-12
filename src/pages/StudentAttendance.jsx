import React, { useState, useEffect } from 'react';
import {
    Table, Card, Statistic, Row, Col, Tag,
    Typography, Spin, Input, DatePicker, Select
} from 'antd';
import {
    CheckCircleOutlined, CloseCircleOutlined,
    ClockCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const StudentAttendance = () => {
    const { profile, loading: authLoading } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [loadingAtt, setLoadingAtt] = useState(false);
    const [dateRange, setDateRange] = useState([null, null]);
    const [statusFilter, setStatusFilter] = useState(null);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (profile?._id) fetchAttendance(profile._id);
    }, [profile]);

    useEffect(() => {
        if (profile?._id) fetchAttendance(profile._id);
    }, [dateRange]);

    const fetchAttendance = async (studentId) => {
        setLoadingAtt(true);
        try {
            let url = `/api/v1/attendance/student/${studentId}`;
            const params = new URLSearchParams();
            if (dateRange[0]) params.append('from', dateRange[0].format('YYYY-MM-DD'));
            if (dateRange[1]) params.append('to', dateRange[1].format('YYYY-MM-DD'));
            if (params.toString()) url += `?${params.toString()}`;

            const res = await axios.get(url);
            setAttendance(res.data.data);
        } catch {
            // silent
        } finally {
            setLoadingAtt(false);
        }
    };

    // ── Client-side filter ────────────────────────────────────────────────────
    const filtered = attendance.filter((r) => {
        const matchStatus = !statusFilter || r.status === statusFilter;
        const matchSearch =
            !searchText ||
            dayjs(r.date).format('YYYY-MM-DD').includes(searchText) ||
            (r.classId?.name || '').toLowerCase().includes(searchText.toLowerCase());
        return matchStatus && matchSearch;
    });

    // ── Stats ─────────────────────────────────────────────────────────────────
    const total        = attendance.length;
    const totalPresent = attendance.filter((r) => r.status === 'Present').length;
    const totalAbsent  = attendance.filter((r) => r.status === 'Absent').length;
    const totalLate    = attendance.filter((r) => r.status === 'Late').length;
    const pct = total > 0 ? ((totalPresent / total) * 100).toFixed(1) : 0;

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (d) => dayjs(d).format('YYYY-MM-DD'),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Class',
            key: 'class',
            render: (_, r) => r.classId?.name || '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s) => {
                const color =
                    s === 'Present' ? 'green' :
                    s === 'Absent'  ? 'red'   :
                    'orange';
                return <Tag color={color}>{s}</Tag>;
            },
            filters: [
                { text: 'Present', value: 'Present' },
                { text: 'Absent',  value: 'Absent'  },
                { text: 'Late',    value: 'Late'    },
            ],
            onFilter: (value, record) => record.status === value,
        },
    ];

    // ── Loading ───────────────────────────────────────────────────────────────
    if (authLoading) {
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
            <Title level={2}>My Attendance</Title>
            <Text type="secondary">
                <strong>{profile.studentName}</strong> ({profile.rollNo})
            </Text>

            {/* ── Stats ── */}
            <Row gutter={[16, 16]} style={{ marginTop: 16, marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card className="hover-card">
                        <Statistic
                            title="Attendance %"
                            value={pct}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: pct >= 75 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="hover-card">
                        <Statistic
                            title="Present"
                            value={totalPresent}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="hover-card">
                        <Statistic
                            title="Absent"
                            value={totalAbsent}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="hover-card">
                        <Statistic
                            title="Late"
                            value={totalLate}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* ── Filters ── */}
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={10}>
                    <DatePicker.RangePicker
                        style={{ width: '100%' }}
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates || [null, null])}
                        placeholder={['From date', 'To date']}
                        disabledDate={(d) => d && d.isAfter(dayjs())}
                    />
                </Col>
                <Col xs={24} sm={7}>
                    <Select
                        placeholder="Filter by status"
                        allowClear
                        style={{ width: '100%' }}
                        onChange={(val) => setStatusFilter(val)}
                        value={statusFilter}
                    >
                        <Option value="Present">Present</Option>
                        <Option value="Absent">Absent</Option>
                        <Option value="Late">Late</Option>
                    </Select>
                </Col>
                <Col xs={24} sm={7}>
                    <Input
                        placeholder="Search by date or class..."
                        prefix={<SearchOutlined />}
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Col>
            </Row>

            {/* ── Table ── */}
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={filtered}
                loading={loadingAtt}
                pagination={{
                    pageSize: 15,
                    showTotal: (t) => `Total ${t} records`,
                }}
            />
        </div>
    );
};

export default StudentAttendance;
