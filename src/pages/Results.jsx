import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, message,
    Tag, Space, Card, Row, Col, Statistic, Popconfirm, Progress, Tooltip
} from 'antd';
import {
    PlusOutlined, PrinterOutlined, EditOutlined,
    DeleteOutlined, ReloadOutlined, SearchOutlined,
    RiseOutlined, FallOutlined, TrophyOutlined, BookOutlined,
    CheckCircleOutlined, CloseCircleOutlined, PercentageOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const { Option } = Select;

const GRADE_COLOR = {
    'A+': 'green',
    'A':  'green',
    'B+': 'blue',
    'B':  'blue',
    'C+': 'orange',
    'C':  'orange',
    'F':  'red',
};

const GRADE_BG_COLOR = {
    'A+': '#f6ffed',
    'A':  '#f6ffed',
    'B+': '#e6f7ff',
    'B':  '#e6f7ff',
    'C+': '#fff7e6',
    'C':  '#fff7e6',
    'F':  '#fff2f0',
};

const calculateGrade = (marks) => {
    if (marks >= 90) return 'A+';
    if (marks >= 85) return 'A';
    if (marks >= 80) return 'B+';
    if (marks >= 75) return 'B';
    if (marks >= 70) return 'C+';
    if (marks >= 60) return 'C';
    return 'F';
};

const Results = () => {
    const [results, setResults] = useState([]);
    const [allResults, setAllResults] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [filterMode, setFilterMode] = useState('student');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingResult, setEditingResult] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    useEffect(() => {
        if (students.length > 0) fetchAllResults();
    }, [students]);

    useEffect(() => {
        if (filterMode === 'student' && selectedStudent) {
            fetchResultsByStudent(selectedStudent, selectedSemester);
        } else if (filterMode === 'class' && selectedClass) {
            fetchResultsByClass(selectedClass, selectedSemester);
        } else {
            setResults([]);
        }
    }, [selectedStudent, selectedClass, selectedSemester, filterMode]);

    // Fetch helpers
    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/v1/students/');
            setStudents(res.data.data);
        } catch {
            message.error('Failed to fetch students');
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await axios.get('/api/v1/classes/');
            setClasses(res.data.data);
        } catch {
            message.error('Failed to fetch classes');
        }
    };

    const fetchResultsByStudent = async (studentId, semester) => {
        setTableLoading(true);
        try {
            const url = semester
                ? `/api/v1/results/student/${studentId}?semester=${semester}`
                : `/api/v1/results/student/${studentId}`;
            const res = await axios.get(url);

            const student = students.find((s) => s._id === studentId);
            const enriched = res.data.data.map((r) => ({
                ...r,
                studentName: student?.studentName || '-',
                rollNo: student?.rollNo || '-',
            }));

            setResults(enriched);
        } catch {
            message.error('Failed to fetch results');
        } finally {
            setTableLoading(false);
        }
    };

    const fetchResultsByClass = async (classId, semester) => {
        setTableLoading(true);
        try {
            const url = semester
                ? `/api/v1/results/class/${classId}?semester=${semester}`
                : `/api/v1/results/class/${classId}`;
            const res = await axios.get(url);

            const enriched = res.data.data.map((r) => {
                const student = students.find(
                    (s) => s._id === (r.studentId?._id || r.studentId)
                );
                return {
                    ...r,
                    studentName:
                        r.studentId?.studentName ||
                        student?.studentName ||
                        '-',
                    rollNo:
                        r.studentId?.rollNo ||
                        student?.rollNo ||
                        '-',
                };
            });

            setResults(enriched);
        } catch {
            message.error('Failed to fetch results');
        } finally {
            setTableLoading(false);
        }
    };

    const fetchAllResults = async () => {
        try {
            const fetches = await Promise.all(
                students.map((s) =>
                    axios
                        .get(`/api/v1/results/student/${s._id}`)
                        .then((r) =>
                            r.data.data.map((result) => ({
                                ...result,
                                studentName: s.studentName,
                                rollNo: s.rollNo,
                            }))
                        )
                        .catch(() => [])
                )
            );
            setAllResults(fetches.flat());
        } catch {
            // silent
        }
    };

    // Filter results based on search text
    const filteredResults = useMemo(() => {
        if (!searchText) return results;
        
        return results.filter((record) =>
            (record.studentName || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (record.subject || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (record.semester || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (record.grade || '').toLowerCase().includes(searchText.toLowerCase())
        );
    }, [results, searchText]);

    // Stats calculations based on FILTERED results (not all results)
    const totalResults = filteredResults.length;
    const avgMarks = totalResults > 0
        ? (filteredResults.reduce((s, r) => s + r.marks, 0) / totalResults).toFixed(1)
        : 0;
    const passCount = filteredResults.filter((r) => r.grade !== 'F').length;
    const failCount = filteredResults.filter((r) => r.grade === 'F').length;
    const passRate = totalResults > 0 ? ((passCount / totalResults) * 100).toFixed(1) : 0;
    
    // Grade distribution based on FILTERED results
    const gradeDistribution = {
        'A+': filteredResults.filter(r => r.grade === 'A+').length,
        'A': filteredResults.filter(r => r.grade === 'A').length,
        'B+': filteredResults.filter(r => r.grade === 'B+').length,
        'B': filteredResults.filter(r => r.grade === 'B').length,
        'C+': filteredResults.filter(r => r.grade === 'C+').length,
        'C': filteredResults.filter(r => r.grade === 'C').length,
        'F': filteredResults.filter(r => r.grade === 'F').length,
    };

    // Handlers
    const handleCreate = async (values) => {
        setSubmitLoading(true);
        try {
            const grade = calculateGrade(Number(values.marks));
            await axios.post('/api/v1/results/', {
                studentId: values.studentId,
                classId: values.classId,
                subject: values.subject,
                marks: Number(values.marks),
                grade,
                semester: values.semester,
            });
            message.success('Marks saved successfully');
            setIsModalVisible(false);
            form.resetFields();
            if (filterMode === 'student' && selectedStudent) {
                fetchResultsByStudent(selectedStudent, selectedSemester);
            } else if (filterMode === 'class' && selectedClass) {
                fetchResultsByClass(selectedClass, selectedSemester);
            }
            fetchAllResults();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to save marks');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditOpen = (record) => {
        setEditingResult(record);
        editForm.setFieldsValue({
            marks: record.marks,
            grade: record.grade,
        });
        setIsEditModalVisible(true);
    };

    const handleEditSave = async (values) => {
        setSubmitLoading(true);
        try {
            await axios.patch(`/api/v1/results/${editingResult._id}`, {
                marks: Number(values.marks),
                grade: values.grade || calculateGrade(Number(values.marks)),
            });
            message.success('Result updated successfully');
            setIsEditModalVisible(false);
            editForm.resetFields();
            setEditingResult(null);
            if (filterMode === 'student' && selectedStudent) {
                fetchResultsByStudent(selectedStudent, selectedSemester);
            } else if (filterMode === 'class' && selectedClass) {
                fetchResultsByClass(selectedClass, selectedSemester);
            }
            fetchAllResults();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to update result');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/v1/results/${id}`);
            message.success('Result deleted');
            if (filterMode === 'student' && selectedStudent) {
                fetchResultsByStudent(selectedStudent, selectedSemester);
            } else if (filterMode === 'class' && selectedClass) {
                fetchResultsByClass(selectedClass, selectedSemester);
            }
            fetchAllResults();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to delete result');
        }
    };

    const generateReportCard = (record) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Student Report Card', 105, 20, null, null, 'center');
        doc.setFontSize(12);
        doc.text(`Student: ${record.studentName || '-'}`, 20, 40);
        doc.text(`Roll No: ${record.rollNo || '-'}`, 20, 50);
        doc.text(`Semester: ${record.semester}`, 20, 60);
        doc.text(`Class: ${record.classId?.name || '-'}`, 20, 70);
        autoTable(doc, {
            startY: 80,
            head: [['Subject', 'Marks', 'Grade']],
            body: [[record.subject, record.marks, record.grade]],
        });
        doc.text(
            'End of Report',
            105,
            doc.lastAutoTable.finalY + 20,
            null, null, 'center'
        );
        doc.save(`${record.studentName}_${record.semester}_ReportCard.pdf`);
        message.success('Report card downloaded');
    };

    // Clear search function
    const clearSearch = () => {
        setSearchText('');
    };

    // Table columns (removed the onFilter since we're filtering with useMemo)
    const columns = [
        {
            title: 'Student',
            dataIndex: 'studentName',
            key: 'studentName',
            sorter: (a, b) => (a.studentName || '').localeCompare(b.studentName || ''),
        },
        {
            title: 'Roll No',
            dataIndex: 'rollNo',
            key: 'rollNo',
            sorter: (a, b) => (a.rollNo || '').localeCompare(b.rollNo || ''),
        },
        {
            title: 'Class',
            key: 'class',
            render: (_, r) => r.classId?.name || '-',
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            sorter: (a, b) => (a.subject || '').localeCompare(b.subject || ''),
        },
        {
            title: 'Marks',
            dataIndex: 'marks',
            key: 'marks',
            render: (marks) => (
                <Tooltip title={`${marks}/100`}>
                    <Space>
                        <Progress 
                            type="circle" 
                            percent={marks} 
                            width={40} 
                            strokeColor={marks >= 60 ? '#52c41a' : '#ff4d4f'}
                            format={(percent) => `${percent}`}
                        />
                        <span>{marks}/100</span>
                    </Space>
                </Tooltip>
            ),
            sorter: (a, b) => a.marks - b.marks,
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (grade, record) => (
                <Tag 
                    color={GRADE_COLOR[grade] || 'default'}
                    style={{ 
                        backgroundColor: GRADE_BG_COLOR[grade],
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 12px'
                    }}
                >
                    {grade}
                </Tag>
            ),
            filters: Object.keys(GRADE_COLOR).map((g) => ({
                text: g, value: g,
            })),
            onFilter: (value, record) => record.grade === value,
        },
        {
            title: 'Semester',
            dataIndex: 'semester',
            key: 'semester',
            sorter: (a, b) => (a.semester || '').localeCompare(b.semester || ''),
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditOpen(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Download Report Card">
                        <Button
                            icon={<PrinterOutlined />}
                            size="small"
                            onClick={() => generateReportCard(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this result?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button icon={<DeleteOutlined />} size="small" danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Modern Stats Cards - Now showing filtered data stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card 
                        hoverable 
                        style={{ 
                            borderTop: '4px solid #1890ff',
                            borderRadius: '10px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                                    <BookOutlined /> Total Records
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                                    {totalResults}
                                </div>
                                {searchText && (
                                    <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                                        Filtered from {results.length}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: '48px', color: '#1890ff' }}>
                                <BookOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card 
                        hoverable 
                        style={{ 
                            borderTop: '4px solid #52c41a',
                            borderRadius: '10px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                                    <RiseOutlined /> Average Marks
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                                    {avgMarks}%
                                </div>
                            </div>
                            <Progress 
                                type="circle" 
                                percent={avgMarks} 
                                width={60} 
                                strokeColor="#52c41a"
                            />
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card 
                        hoverable 
                        style={{ 
                            borderTop: '4px solid #faad14',
                            borderRadius: '10px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
                                    <PercentageOutlined /> Pass Rate
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>
                                    {passRate}%
                                </div>
                                <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                                    {passCount} Passed / {failCount} Failed
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <CheckCircleOutlined style={{ fontSize: '40px', color: '#52c41a', marginRight: '8px' }} />
                                <CloseCircleOutlined style={{ fontSize: '40px', color: '#ff4d4f' }} />
                            </div>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card 
                        hoverable 
                        style={{ 
                            borderTop: '4px solid #722ed1',
                            borderRadius: '10px'
                        }}
                    >
                        <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '12px' }}>
                            <TrophyOutlined /> Grade Distribution
                        </div>
                        <Row gutter={[8, 8]}>
                            {Object.entries(gradeDistribution).map(([grade, count]) => (
                                count > 0 && (
                                    <Col span={12} key={grade}>
                                        <Tag 
                                            color={GRADE_COLOR[grade]} 
                                            style={{ width: '100%', textAlign: 'center' }}
                                        >
                                            {grade}: {count}
                                        </Tag>
                                    </Col>
                                )
                            ))}
                            {totalResults === 0 && (
                                <Col span={24}>
                                    <div style={{ textAlign: 'center', color: '#8c8c8c' }}>
                                        No data
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Filter controls */}
            <Card style={{ marginBottom: 16, borderRadius: '10px' }}>
                <Space wrap size="middle">
                    <div>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>
                            Filter by
                        </div>
                        <Select
                            value={filterMode}
                            onChange={(v) => {
                                setFilterMode(v);
                                setResults([]);
                                setSelectedStudent(null);
                                setSelectedClass(null);
                                setSearchText(''); // Clear search when changing filter mode
                            }}
                            style={{ width: 130 }}
                        >
                            <Option value="student">Student</Option>
                            <Option value="class">Class</Option>
                        </Select>
                    </div>

                    {filterMode === 'student' && (
                        <div>
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>
                                Student
                            </div>
                            <Select
                                placeholder="Select student"
                                style={{ width: 250 }}
                                showSearch
                                allowClear
                                optionFilterProp="children"
                                onChange={(val) => {
                                    setSelectedStudent(val);
                                    setSearchText(''); // Clear search when changing student
                                }}
                                value={selectedStudent}
                            >
                                {students.map((s) => (
                                    <Option key={s._id} value={s._id}>
                                        {s.studentName} — {s.rollNo}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    )}

                    {filterMode === 'class' && (
                        <div>
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>
                                Class
                            </div>
                            <Select
                                placeholder="Select class"
                                style={{ width: 200 }}
                                allowClear
                                onChange={(val) => {
                                    setSelectedClass(val);
                                    setSearchText(''); // Clear search when changing class
                                }}
                                value={selectedClass}
                            >
                                {classes.map((c) => (
                                    <Option key={c._id} value={c._id}>
                                        {c.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    )}

                    <div>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4, fontWeight: 500 }}>
                            Search
                        </div>
                        <Input
                            placeholder="Search name / subject / grade..."
                            prefix={<SearchOutlined />}
                            allowClear
                            style={{ width: 250 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            suffix={
                                searchText && (
                                    <Button 
                                        type="text" 
                                        size="small" 
                                        onClick={clearSearch}
                                        style={{ marginRight: -8 }}
                                    >
                                        Clear
                                    </Button>
                                )
                            }
                        />
                    </div>
                </Space>
            </Card>

            {/* Action buttons */}
            <div style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ margin: 0, fontWeight: 600 }}>📊 Results & Grading</h3>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            fetchAllResults();
                            if (filterMode === 'student' && selectedStudent) {
                                fetchResultsByStudent(selectedStudent, selectedSemester);
                            } else if (filterMode === 'class' && selectedClass) {
                                fetchResultsByClass(selectedClass, selectedSemester);
                            }
                        }}
                    >
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    >
                        Enter Marks
                    </Button>
                </Space>
            </div>

            {/* Table - showing filtered results */}
            {!selectedStudent && !selectedClass ? (
                <Card style={{ borderRadius: '10px' }}>
                    <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>
                        <BookOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                        <div style={{ fontSize: 16 }}>Select a student or class above to view results</div>
                    </div>
                </Card>
            ) : (
                <Table
                    columns={columns}
                    dataSource={filteredResults}
                    rowKey="_id"
                    loading={tableLoading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} results`,
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                    scroll={{ x: 1100 }}
                    style={{ borderRadius: '10px' }}
                />
            )}

            {/* Create Modal */}
            <Modal
                title="📝 Enter Student Marks"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
                width={500}
            >
                <Form layout="vertical" onFinish={handleCreate} form={form}>
                    <Form.Item
                        name="studentId"
                        label="Student"
                        rules={[{ required: true, message: 'Please select a student' }]}
                    >
                        <Select
                            placeholder="Select student"
                            showSearch
                            optionFilterProp="children"
                        >
                            {students.map((s) => (
                                <Option key={s._id} value={s._id}>
                                    {s.studentName} — {s.rollNo}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="classId"
                        label="Class"
                        rules={[{ required: true, message: 'Please select a class' }]}
                    >
                        <Select placeholder="Select class">
                            {classes.map((c) => (
                                <Option key={c._id} value={c._id}>
                                    {c.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="subject"
                        label="Subject"
                        rules={[{ required: true, message: 'Please enter subject' }]}
                    >
                        <Input placeholder="e.g. Mathematics" />
                    </Form.Item>

                    <Form.Item
                        name="marks"
                        label="Marks (0–100)"
                        rules={[{ required: true, message: 'Please enter marks' }]}
                    >
                        <Input type="number" min={0} max={100} />
                    </Form.Item>

                    <Form.Item
                        name="semester"
                        label="Semester"
                        rules={[{ required: true, message: 'Please enter semester' }]}
                    >
                        <Input placeholder="e.g. Fall-2024" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={submitLoading}
                            size="large"
                        >
                            Save Marks
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="✏️ Update Result"
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    editForm.resetFields();
                    setEditingResult(null);
                }}
                footer={null}
                destroyOnClose
                width={450}
            >
                <Form layout="vertical" onFinish={handleEditSave} form={editForm}>
                    <Form.Item
                        name="marks"
                        label="Marks (0–100)"
                        rules={[{ required: true, message: 'Please enter marks' }]}
                    >
                        <Input type="number" min={0} max={100} />
                    </Form.Item>

                    <Form.Item
                        name="grade"
                        label="Grade (leave blank to auto-calculate)"
                    >
                        <Select allowClear placeholder="Auto-calculate from marks">
                            {Object.keys(GRADE_COLOR).map((g) => (
                                <Option key={g} value={g}>{g}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={submitLoading}
                            size="large"
                        >
                            Update Result
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Results;