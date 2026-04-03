import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, DatePicker, Radio, message, Typography, Space, Select } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { studentsData } from '../data/students';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const TeacherAttendance = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [subject, setSubject] = useState('Mathematics');

    const roster = useMemo(
        () => studentsData.filter((s) => user?.assignedPrograms?.includes(s.program)),
        [user]
    );

    const [attendance, setAttendance] = useState({});

    useEffect(() => {
        const next = {};
        roster.forEach((s) => {
            next[s.id] = 'Present';
        });
        setAttendance(next);
    }, [roster]);

    const handleStatusChange = (studentId, status) => {
        setAttendance((prev) => ({ ...prev, [studentId]: status }));
    };

    const handleSave = () => {
        message.success(
            `Attendance saved locally for ${selectedDate.format('YYYY-MM-DD')} — ${subject} (demo; no backend).`
        );
    };

    const columns = [
        { title: 'Roll', dataIndex: 'rollNumber', key: 'roll' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Class', dataIndex: 'classLabel', key: 'classLabel' },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Radio.Group
                    value={attendance[record.id] || 'Present'}
                    onChange={(e) => handleStatusChange(record.id, e.target.value)}
                >
                    <Radio.Button value="Present">Present</Radio.Button>
                    <Radio.Button value="Absent">Absent</Radio.Button>
                </Radio.Group>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Mark attendance</Title>
            <Text type="secondary">
                Students are filtered to your assigned programs. Data is saved only in this browser session (static
                demo).
            </Text>
            <div style={{ margin: '16px 0', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                <Space>
                    <span>Date</span>
                    <DatePicker value={selectedDate} onChange={(d) => setSelectedDate(d || dayjs())} />
                </Space>
                <Space>
                    <span>Subject</span>
                    <Select
                        style={{ minWidth: 180 }}
                        value={subject}
                        onChange={setSubject}
                        options={[
                            { value: 'Mathematics', label: 'Mathematics' },
                            { value: 'Physics', label: 'Physics' },
                            { value: 'Economics', label: 'Economics' },
                            { value: 'Studio', label: 'Studio' },
                            { value: 'Mechanics', label: 'Mechanics' },
                        ]}
                    />
                </Space>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                    Save attendance
                </Button>
            </div>
            <Table rowKey="id" columns={columns} dataSource={roster} pagination={false} />
        </div>
    );
};

export default TeacherAttendance;
