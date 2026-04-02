import React from 'react';
import { Card, Table, Typography } from 'antd';
import { resultsData } from '../data/results';
import { studentsData } from '../data/students';
import { useParams } from 'react-router-dom';
import { teacherClassCards } from '../data/teacherClassCards';

const { Title, Text } = Typography;

// Results view is read-only for teacher in this demo UI.
const TeacherClassResults = () => {
    const { classKey } = useParams();

    const classCard = teacherClassCards.find((c) => c.key === classKey) || null;

    // Demo-only mapping: UI class cards -> student programs.
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
    const rows = resultsData.filter((r) => allowedIds.has(r.studentId));

    const columns = [
        { title: 'Student', dataIndex: 'studentName', key: 'studentName' },
        { title: 'Subject', dataIndex: 'subject', key: 'subject' },
        { title: 'Marks', dataIndex: 'marks', key: 'marks' },
        { title: 'Grade', dataIndex: 'grade', key: 'grade' },
        { title: 'Term', dataIndex: 'term', key: 'term' },
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 10 }}>
                Results: {classCard?.label || classKey}
            </Title>
            <Text type="secondary">Read-only demo for the selected class.</Text>
            <Card style={{ marginTop: 16 }} bordered>
                <Table rowKey="key" columns={columns} dataSource={rows} pagination={false} />
            </Card>
        </div>
    );
};

export default TeacherClassResults;

