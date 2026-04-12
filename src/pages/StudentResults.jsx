import React, { useState, useEffect } from 'react';
import {
    Card, Table, Tag, Typography, Spin,
    Row, Col, Statistic, Input, Select
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const GRADE_COLOR = {
    'A+': 'green', 'A':  'green',
    'B+': 'blue',  'B':  'blue',
    'C+': 'orange','C':  'orange',
    'F':  'red',
};

const StudentResults = () => {
    const { profile, loading: authLoading } = useAuth();
    const [results, setResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(null);

    useEffect(() => {
        if (profile?._id) fetchResults(profile._id);
    }, [profile]);

    const fetchResults = async (studentId) => {
        setLoadingResults(true);
        try {
            const res = await axios.get(`/api/v1/results/student/${studentId}`);
            setResults(res.data.data);
        } catch {
            // silent
        } finally {
            setLoadingResults(false);
        }
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const avgMarks = results.length > 0
        ? (results.reduce((s, r) => s + r.marks, 0) / results.length).toFixed(1)
        : 0;
    const passCount = results.filter((r) => r.grade !== 'F').length;
    const failCount = results.filter((r) => r.grade === 'F').length;

    // ── Unique semesters for dropdown ─────────────────────────────────────────
    const semesters = [...new Set(results.map((r) => r.semester))];

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = results.filter((r) => {
        const matchSearch =
            !searchText ||
            r.subject.toLowerCase().includes(searchText.toLowerCase()) ||
            r.semester.toLowerCase().includes(searchText.toLowerCase());
        const matchSemester = !selectedSemester || r.semester === selectedSemester;
        return matchSearch && matchSemester;
    });

    // ── Columns ───────────────────────────────────────────────────────────────
    const columns = [
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Marks',
            dataIndex: 'marks',
            key: 'marks',
            sorter: (a, b) => a.marks - b.marks,
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (g) => (
                <Tag color={GRADE_COLOR[g] || 'default'}>{g}</Tag>
            ),
            filters: Object.keys(GRADE_COLOR).map((g) => ({ text: g, value: g })),
            onFilter: (value, record) => record.grade === value,
        },
        {
            title: 'Semester',
            dataIndex: 'semester',
            key: 'semester',
        },
        {
            title: 'Class',
            key: 'class',
            render: (_, r) => r.classId?.name || '-',
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
            <Title level={2}>My Results & Grades</Title>
            <Text type="secondary">
                View only — contact admin for corrections (use approval workflow).
            </Text>

            {/* ── Stats ── */}
            <Row gutter={[16, 16]} style={{ marginTop: 16, marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card className="hover-card">
                        <Statistic
                            title="Avg Marks"
                            value={avgMarks}
                            suffix="/ 100"
                            valueStyle={{ color: avgMarks >= 60 ? '#52c41a' : '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="hover-card">
                        <Statistic
                            title="Total Subjects"
                            value={results.length}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="hover-card">
                        <Statistic
                            title="Passed"
                            value={passCount}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="hover-card">
                        <Statistic
                            title="Failed"
                            value={failCount}
                            valueStyle={{ color: failCount > 0 ? '#ff4d4f' : '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* ── Filters ── */}
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12}>
                    <Input
                        placeholder="Search by subject or semester..."
                        prefix={<SearchOutlined />}
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Col>
                <Col xs={24} sm={12}>
                    <Select
                        placeholder="Filter by semester"
                        allowClear
                        style={{ width: '100%' }}
                        onChange={(val) => setSelectedSemester(val)}
                        value={selectedSemester}
                    >
                        {semesters.map((s) => (
                            <Option key={s} value={s}>{s}</Option>
                        ))}
                    </Select>
                </Col>
            </Row>

            {/* ── Table ── */}
            <Card>
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={filtered}
                    loading={loadingResults}
                    pagination={{
                        pageSize: 10,
                        showTotal: (t) => `Total ${t} results`,
                    }}
                />
            </Card>
        </div>
    );
};

export default StudentResults;
