import React from 'react';
import { Calendar, Badge, Select, Typography } from 'antd';
import { timetableData } from '../data/timetable';

const { Title } = Typography;

const StudentTimetable = () => {
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
                        <Badge status="success" text={`${item.time} - ${item.subject} (${item.room})`} />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            <Title level={2}>My Timetable</Title>
            <Calendar dateCellRender={dateCellRender} mode="month" />
        </div>
    );
};

export default StudentTimetable;
