import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Tag, Input, Spin, Select } from 'antd';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const GRADE_COLOR = {
    'A+': 'green', 'A': 'green',
    'B+': 'blue',  'B': 'blue',
    'C+': 'orange','C': 'orange',
    'F':  'red',
};

const TeacherClassResults = () => {
    const { classId } = useParams();
    const [classInfo, setClassInfo] = useState(null);
    const [results, setResults] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [semesterFilter, setSemesterFilter] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (classId) {
            fetchClassInfo();
            fetchResults();
        }
    }, [classId]);

    useEffect(() => {
        if (classId) fetchResults();
    }, [semesterFilter]);

    const fetchClassInfo = async () => {
        try {
            const res = await axios.get(`/api/v1/classes/${classId}`);
            setClassInfo(res.data.data);
        } catch { /* silent */ }
    };

    const fetchResults = async () => {
        setLoading(true);
        try {
            const url = semesterFilter
                ? `/api/v1/results/class/${classId}?semester=${semesterFilter}`
                : `/api/v1/results/class/${classId}`;
            const res = await axios.get(url);
            const enriched = res.data.data.map((r) => ({
                ...r,
                studentName: r.studentId?.studentName || '-',
                rollNo:      r.studentId?.rollNo      || '-',
            }));
            setResults(enriched);
        } catch {
            message.error('Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    // ── Unique semesters for filter ───────────────────────────────────────────
    const semesters = [...new Set(results.map((r) => r.semester))];

    // ── Client-side search ────────────────────────────────────────────────────
    const filtered = results.filter((r) => {
        const q = searchText.trim().toLowerCase();
        return (
            !q ||
            r.studentName?.toLowerCase().includes(q) ||
            r.subject?.toLowerCase().includes(q) ||
            r.rollNo?.toLowerCase().includes(q)
        );
    });

    const columns = [
        { title: 'Roll No',  dataIndex: 'rollNo',      key: 'rollNo' },
        { title: 'Student',  dataIndex: 'studentName', key: 'studentName' },
        { title: 'Subject',  dataIndex: 'subject',     key: 'subject' },
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
            render: (g) => <Tag color={GRADE_COLOR[g] || 'default'}>{g}</Tag>,
            filters: Object.keys(GRADE_COLOR).map((g) => ({ text: g, value: g })),
            onFilter: (value, record) => record.grade === value,
        },
        { title: 'Semester', dataIndex: 'semester', key: 'semester' },
    ];

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
    }

    return (
        <div>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-end', flexWrap: 'wrap', gap: 16,
                marginBottom: 16,
            }}>
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        Results: {classInfo?.name || classId}
                    </Title>
                    <Text type="secondary">
                        View-only — results are managed by admin. Contact admin for corrections.
                    </Text>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Input
                        placeholder="Search student, subject..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 240 }}
                    />
                    <Select
                        placeholder="Filter by semester"
                        allowClear
                        style={{ width: 180 }}
                        onChange={(val) => setSemesterFilter(val)}
                        value={semesterFilter}
                    >
                        {semesters.map((s) => (
                            <Option key={s} value={s}>{s}</Option>
                        ))}
                    </Select>
                </div>
            </div>

            <Card bordered>
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={filtered}
                    pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} results` }}
                />
            </Card>
        </div>
    );
};

export default TeacherClassResults;
