import React, { useMemo, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Typography, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { resultsData as seedResults } from '../data/results';
import { studentsData } from '../data/students';
import { useAuth } from '../context/AuthContext';

const { Option } = Select;
const { Title, Text } = Typography;

const calculateGrade = (marks) => {
    const m = Number(marks);
    if (m >= 90) return 'A+';
    if (m >= 85) return 'A';
    if (m >= 80) return 'B+';
    if (m >= 75) return 'B';
    if (m >= 70) return 'C+';
    if (m >= 60) return 'C';
    return 'F';
};

const TeacherResults = () => {
    const { user } = useAuth();
    const [results, setResults] = useState(seedResults);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    const allowedStudents = useMemo(
        () => studentsData.filter((s) => user?.assignedPrograms?.includes(s.program)),
        [user]
    );

    const rows = useMemo(
        () => results.filter((r) => allowedStudents.some((s) => s.id === r.studentId)),
        [results, allowedStudents]
    );

    const handleAdd = (values) => {
        const marks = Number(values.marks);
        const grade = calculateGrade(marks);
        const st = allowedStudents.find((s) => s.id === values.studentId);
        const newRow = {
            key: `t-${Date.now()}`,
            studentId: values.studentId,
            studentName: st?.name || values.studentId,
            subject: values.subject,
            marks,
            grade,
            term: values.term,
            assessment: 'Composite',
        };
        setResults([...results, newRow]);
        setOpen(false);
        form.resetFields();
        message.success('Marks saved locally (demo).');
    };

    const columns = [
        { title: 'Student', dataIndex: 'studentName', key: 'studentName' },
        { title: 'Subject', dataIndex: 'subject', key: 'subject' },
        { title: 'Marks', dataIndex: 'marks', key: 'marks' },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (g) => <Tag color={g === 'F' ? 'red' : 'green'}>{g}</Tag>,
        },
        { title: 'Term', dataIndex: 'term', key: 'term' },
    ];

    return (
        <div>
            <Title level={2}>Enter results</Title>
            <Text type="secondary">Grades follow predefined rules. Session-only storage for new rows.</Text>
            <div style={{ margin: '16px 0' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
                    Add marks
                </Button>
            </div>
            <Table rowKey="key" columns={columns} dataSource={rows} />

            <Modal title="Enter marks" open={open} onCancel={() => setOpen(false)} footer={null} destroyOnClose>
                <Form layout="vertical" form={form} onFinish={handleAdd}>
                    <Form.Item name="studentId" label="Student" rules={[{ required: true }]}>
                        <Select placeholder="Select student">
                            {allowedStudents.map((s) => (
                                <Option key={s.id} value={s.id}>
                                    {s.name} ({s.rollNumber})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="marks" label="Marks (0–100)" rules={[{ required: true }]}>
                        <Input type="number" min={0} max={100} />
                    </Form.Item>
                    <Form.Item name="term" label="Term" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Midterm">Midterm</Option>
                            <Option value="Final">Final</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeacherResults;
