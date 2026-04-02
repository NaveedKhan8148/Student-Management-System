import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space } from 'antd';
import { PlusOutlined, PrinterOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { resultsData as initialData } from '../data/results';
import { studentsData } from '../data/students';

const { Option } = Select;

const Results = () => {
    const [results, setResults] = useState(initialData);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const columns = [
        {
            title: 'Student Name',
            dataIndex: 'studentName',
            key: 'studentName',
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Marks',
            dataIndex: 'marks',
            key: 'marks',
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (grade) => {
                let color = 'green';
                if (grade === 'B' || grade === 'B+') color = 'blue';
                if (grade === 'C') color = 'orange';
                if (grade === 'F') color = 'red';
                return <Tag color={color}>{grade}</Tag>;
            },
        },
        {
            title: 'Term',
            dataIndex: 'term',
            key: 'term',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button icon={<PrinterOutlined />} size="small" onClick={() => generateReportCard(record)}>
                    Print
                </Button>
            ),
        },
    ];

    const calculateGrade = (marks) => {
        if (marks >= 90) return 'A+';
        if (marks >= 85) return 'A';
        if (marks >= 80) return 'B+';
        if (marks >= 75) return 'B';
        if (marks >= 70) return 'C+';
        if (marks >= 60) return 'C';
        return 'F';
    };

    const handleAddMarks = (values) => {
        const grade = calculateGrade(Number(values.marks));
        const match = studentsData.find((s) => s.name === values.studentName);
        const newResult = {
            key: String(results.length + 1),
            studentId: match?.id || 'STU000',
            studentName: values.studentName,
            subject: values.subject,
            marks: Number(values.marks),
            grade: grade,
            term: values.term,
            assessment: 'Composite',
        };
        setResults([...results, newResult]);
        setIsModalVisible(false);
        form.resetFields();
        message.success('Marks entered successfully');
    };

    const generateReportCard = (record) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Student Report Card', 105, 20, null, null, 'center');

        doc.setFontSize(12);
        doc.text(`Student Name: ${record.studentName}`, 20, 40);
        doc.text(`Term: ${record.term}`, 20, 50);

        autoTable(doc, {
            startY: 60,
            head: [['Subject', 'Marks', 'Grade']],
            body: [
                [record.subject, record.marks, record.grade],
            ],
        });

        doc.save(`${record.studentName}_ReportCard.pdf`);
        message.success('Report card downloaded');
    };

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Results & Grading</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Enter Marks
                </Button>
            </div>

            <Table columns={columns} dataSource={results} />

            <Modal
                title="Enter Student Marks"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleAddMarks} form={form}>
                    <Form.Item
                        name="studentName"
                        label="Student Name"
                        rules={[{ required: true, message: 'Please enter student name' }]}
                    >
                        <Input />
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
                        label="Marks (0-100)"
                        rules={[{ required: true, message: 'Please enter marks' }]}
                    >
                        <Input type="number" max={100} min={0} />
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
                            Save Marks
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Results;
