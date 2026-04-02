import React from 'react';
import { Calendar, Badge, Typography } from 'antd';
import { timetableData } from '../data/timetable';

const { Title, Text } = Typography;

const TeacherClassTimetable = () => {
    const getListData = (value) => {
        const dayName = value.format('dddd');
        return timetableData.filter((item) => item.day === dayName);
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listData.map((item) => (
                    <li key={item.key} style={{ marginBottom: 6 }}>
                        <Badge status="success" text={`${item.time} - ${item.subject} (${item.room})`} />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            <Title level={3} style={{ marginBottom: 10 }}>
                TimeTable
            </Title>
            <Text type="secondary">Weekly timetable (static demo, same for all classes).</Text>
            <div style={{ marginTop: 16 }}>
                <Calendar dateCellRender={dateCellRender} mode="month" />
            </div>
        </div>
    );
};

export default TeacherClassTimetable;

