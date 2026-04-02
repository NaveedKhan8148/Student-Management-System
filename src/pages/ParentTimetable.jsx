import React from 'react';
import { Badge, Calendar, Typography } from 'antd';
import { timetableData } from '../data/timetable';
import { useChildStudent } from '../hooks/useChildStudent';

const { Title, Text } = Typography;

const ParentTimetable = () => {
    const child = useChildStudent();

    const getListData = (value) => {
        const dayName = value.format('dddd');
        return timetableData.filter((item) => item.day === dayName);
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
                {listData.map((item) => (
                    <li key={item.key}>
                        <Badge status="success" text={`${item.time} — ${item.subject} (${item.room})`} />
                    </li>
                ))}
            </ul>
        );
    };

    if (!child) return <Text type="danger">No linked student.</Text>;

    return (
        <div>
            <Title level={2}>Timetable</Title>
            <Text type="secondary">Read-only schedule (same institutional timetable as students view)</Text>
            <Calendar style={{ marginTop: 16 }} dateCellRender={dateCellRender} mode="month" />
        </div>
    );
};

export default ParentTimetable;
