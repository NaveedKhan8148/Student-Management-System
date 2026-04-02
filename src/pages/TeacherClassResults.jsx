import React, { useMemo, useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Table, Typography, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { resultsData as initialResults } from '../data/results';
import { studentsData } from '../data/students';
import { useParams } from 'react-router-dom';
import { teacherClassCards } from '../data/teacherClassCards';

const { Title, Text } = Typography;
const { Option } = Select;

const calculateGrade = (marks) => {
    if (marks >= 90) return 'A+';
    if (marks >= 85) return 'A';
    if (marks >= 80) return 'B+';
    if (marks >= 75) return 'B';
    if (marks >= 70) return 'C+';
    if (marks >= 60) return 'C';
    return 'F';
};

const TeacherClassResults = () => {
    const [results, setResults] = useState(initialResults);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingResult, setEditingResult] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const { classKey } = useParams();
    const classCard = teacherClassCards.find((c) => c.key === classKey) || null;

    const mappedProgram =
        classKey === 'class2'
            ? 'Business Administration'
            : classKey === 'class3'
              ? 'Engineering'
              : classKey === 'class4'
                ? 'Arts'
                : 'Computer Science';

    const allowedStudents = studentsData.filter((s) => s.program === mappedProgram);
    const allowedIds = new Set(allowedStudents.map((s) => s.id));
    const rollMap = useMemo(
        () => new Map(studentsData.map((s) => [s.id, s.rollNumber])),
        []
    );

    const searchQuery = searchText.trim().toLowerCase();
    const rows = useMemo(
        () =>
            results
                .filter((r) => allowedIds.has(r.studentId))
                .map((r) => ({ ...r, rollNo: rollMap.get(r.studentId) || '' }))
                .filter((r) => {
                    if (!searchQuery) {
                        return true;
                    }
                    return (
                        r.studentName.toLowerCase().includes(searchQuery) ||
                        r.subject.toLowerCase().includes(searchQuery) ||
                        r.term.toLowerCase().includes(searchQuery) ||
                        r.rollNo.toLowerCase().includes(searchQuery)
                    );
                }),
        [results, allowedIds, rollMap, searchQuery]
    );

    const columns = [
        { title: 'Roll No', dataIndex: 'rollNo', key: 'rollNo' },
        { title: 'Student', dataIndex: 'studentName', key: 'studentName' },
        { title: 'Subject', dataIndex: 'subject', key: 'subject' },
        { title: 'Marks', dataIndex: 'marks', key: 'marks' },
        { title: 'Grade', dataIndex: 'grade', key: 'grade' },
        { title: 'Term', dataIndex: 'term', key: 'term' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                >
                    Edit
                </Button>
            ),
        },
    ];

    const handleEdit = (record) => {
        setEditingResult(record);
        form.setFieldsValue({
            studentName: record.studentName,
            subject: record.subject,
            marks: record.marks,
            term: record.term,
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingResult(null);
        form.resetFields();
    };

    const handleSave = (values) => {
        const updatedResults = results.map((item) => {
            if (item.key === editingResult.key) {
                const marks = Number(values.marks);
                return {
                    ...item,
                    subject: values.subject,
                    marks,
                    grade: calculateGrade(marks),
                    term: values.term,
                };
            }
            return item;
        });

        setResults(updatedResults);
        message.success('Result updated successfully');
        handleCancel();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={3} style={{ marginBottom: 10 }}>
                        Results: {classCard?.label || classKey}
                    </Title>
                    <Text type="secondary">Teacher editable result sheet for this class.</Text>
                </div>
                <div style={{ minWidth: 260, flex: '1 1 auto', maxWidth: 360 }}>
                    <Input
                        placeholder="Search student, subject or term"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            <Card style={{ marginTop: 16 }} bordered>
                <Table rowKey="key" columns={columns} dataSource={rows} pagination={{ pageSize: 10 }} />
            </Card>

            <Modal
                title="Edit student result"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form layout="vertical" form={form} onFinish={handleSave}>
                    <Form.Item
                        name="studentName"
                        label="Student Name"
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="subject"
                        label="Subject"
                        rules={[{ required: true, message: 'Please enter subject' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="marks"
                        label="Marks"
                        rules={[{ required: true, message: 'Please enter marks' }]}
                    >
                        <Input type="number" min={0} max={100} />
                    </Form.Item>
                    <Form.Item
                        name="term"
                        label="Term"
                        rules={[{ required: true, message: 'Please select term' }]}
                    >
                        <Select>
                            <Option value="Midterm">Midterm</Option>
                            <Option value="Final">Final</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Save changes
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeacherClassResults;

