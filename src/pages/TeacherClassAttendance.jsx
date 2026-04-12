import React, { useState, useEffect } from 'react';
import {
    Button, Card, Col, Input, Row, Space,
    Statistic, Table, Typography, Spin, message
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const TeacherClassAttendance = () => {
    const { classId } = useParams(); // ✅ classId = MongoDB _id
    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [existingRecords, setExistingRecords] = useState({});
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const today = dayjs();
    const todayStr   = today.format('YYYY-MM-DD');
    const todayLabel = today.format('DD MMM YYYY');

    useEffect(() => {
        if (classId) {
            fetchClassInfo();
            fetchStudents();
            fetchExistingAttendance();
        }
    }, [classId]);

    const fetchClassInfo = async () => {
        try {
            const res = await axios.get(`/api/v1/classes/${classId}`);
            setClassInfo(res.data.data);
        } catch { /* silent */ }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/students/class/${classId}`);
            const list = res.data.data;
            setStudents(list);
            // Default all to Present
            const init = {};
            list.forEach((s) => { init[s._id] = 'Present'; });
            setAttendance((prev) => ({ ...init, ...prev }));
        } catch {
            message.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingAttendance = async () => {
        try {
            const res = await axios.get(
                `/api/v1/attendance/class/${classId}?date=${todayStr}`
            );
            const records = res.data.data;
            const statusMap = {};
            const idMap = {};
            records.forEach((r) => {
                const sid = r.studentId?._id || r.studentId;
                statusMap[sid] = r.status;
                idMap[sid] = r._id;
            });
            setAttendance((prev) => ({ ...prev, ...statusMap }));
            setExistingRecords(idMap);
        } catch { /* no records yet is fine */ }
    };

    const handleSetStatus = (studentId, status) => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    // ── Save: bulk POST for new records, PATCH for existing ──────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            const toCreate = [];
            const toUpdate = [];

            students.forEach((s) => {
                const status = attendance[s._id] || 'Present';
                if (existingRecords[s._id]) {
                    toUpdate.push({ id: existingRecords[s._id], status });
                } else {
                    toCreate.push({
                        studentId: s._id,
                        classId,
                        date: todayStr,
                        status,
                    });
                }
            });

            if (toCreate.length > 0) {
                await axios.post('/api/v1/attendance/bulk', { records: toCreate });
            }
            await Promise.all(
                toUpdate.map((r) =>
                    axios.patch(`/api/v1/attendance/${r.id}`, { status: r.status })
                )
            );

            message.success(`Attendance saved for ${todayStr}`);
            // Refresh saved indicators
            fetchExistingAttendance();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const presentCount = Object.values(attendance).filter((v) => v === 'Present').length;
    const absentCount  = Object.values(attendance).filter((v) => v === 'Absent').length;
    const lateCount    = Object.values(attendance).filter((v) => v === 'Late').length;

    // ── Filter by search ──────────────────────────────────────────────────────
    const filtered = students.filter((s) => {
        const q = searchText.trim().toLowerCase();
        return (
            !q ||
            s.studentName?.toLowerCase().includes(q) ||
            s.rollNo?.toLowerCase().includes(q)
        );
    });

    const columns = [
        { title: 'Roll No', dataIndex: 'rollNo', key: 'rollNo', width: 120 },
        { title: 'Student Name', dataIndex: 'studentName', key: 'studentName' },
        {
            title: 'Date',
            key: 'date',
            width: 140,
            render: () => todayLabel,
        },
        {
            title: 'Mark Attendance',
            key: 'action',
            render: (_, record) => (
                <Space size={8} wrap>
                    <Button
                        size="small"
                        type={attendance[record._id] === 'Present' ? 'primary' : 'default'}
                        style={
                            attendance[record._id] === 'Present'
                                ? { backgroundColor: '#52c41a', borderColor: '#52c41a' }
                                : {}
                        }
                        onClick={() => handleSetStatus(record._id, 'Present')}
                    >
                        Present
                    </Button>
                    <Button
                        size="small"
                        type={attendance[record._id] === 'Absent' ? 'primary' : 'default'}
                        danger={attendance[record._id] === 'Absent'}
                        onClick={() => handleSetStatus(record._id, 'Absent')}
                    >
                        Absent
                    </Button>
                    <Button
                        size="small"
                        type={attendance[record._id] === 'Late' ? 'primary' : 'default'}
                        style={
                            attendance[record._id] === 'Late'
                                ? { backgroundColor: '#faad14', borderColor: '#faad14' }
                                : {}
                        }
                        onClick={() => handleSetStatus(record._id, 'Late')}
                    >
                        Late
                    </Button>
                </Space>
            ),
        },
        {
            title: 'Saved',
            key: 'saved',
            width: 70,
            render: (_, record) =>
                existingRecords[record._id]
                    ? <span style={{ color: '#52c41a', fontWeight: 600 }}>✓</span>
                    : <span style={{ color: '#ccc' }}>—</span>,
        },
    ];

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
    }

    return (
        <div>
            {/* ── Stat cards ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={6}>
                    <Card className="hover-card" style={{ borderRadius: 12 }}>
                        <Statistic title="Total Students" value={students.length} />
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card className="hover-card" style={{ borderRadius: 12 }}>
                        <Statistic title="Present" value={presentCount} valueStyle={{ color: '#389e0d' }} />
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card className="hover-card" style={{ borderRadius: 12 }}>
                        <Statistic title="Absent" value={absentCount} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card className="hover-card" style={{ borderRadius: 12 }}>
                        <Statistic title="Late" value={lateCount} valueStyle={{ color: '#faad14' }} />
                    </Card>
                </Col>
            </Row>

            <Card className="hover-card" style={{ borderRadius: 14 }}>
                <div style={{
                    marginBottom: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                }}>
                    <div>
                        <Title level={4} style={{ marginBottom: 4 }}>
                            {classInfo?.name || 'Class'} — Attendance
                        </Title>
                        <Text type="secondary">
                            Attendance for today: <strong>{todayLabel}</strong>
                        </Text>
                    </div>

                    <Space wrap>
                        <Input
                            placeholder="Search by roll or name"
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 220 }}
                        />
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            loading={saving}
                            disabled={students.length === 0}
                        >
                            Save Attendance
                        </Button>
                    </Space>
                </div>

                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={filtered}
                    pagination={{ pageSize: 15 }}
                    bordered
                />
            </Card>

            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                Attendance can only be recorded for today. Past records are view-only.
            </Text>
        </div>
    );
};

export default TeacherClassAttendance;
