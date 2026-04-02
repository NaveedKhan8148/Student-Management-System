import React, { useState } from 'react';
import { Calendar, Badge, Modal, Form, Input, Select, TimePicker, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { timetableData as initialData } from '../data/timetable';

const { Option } = Select;

const Timetable = () => {
    const [timetable, setTimetable] = useState(initialData);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const getListData = (value) => {
        const dayName = value.format('dddd');
        return timetable.filter((item) => item.day === dayName);
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

    const handleAddClass = (values) => {
        const newClass = {
            key: String(timetable.length + 1),
            day: values.day,
            time: `${values.startTime.format('HH:mm')} - ${values.endTime.format('HH:mm')}`,
            subject: values.subject,
            teacher: values.teacher,
            room: values.room,
        };
        setTimetable([...timetable, newClass]);
        setIsModalVisible(false);
        form.resetFields();
        message.success('Class added successfully');
    };

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Weekly Timetable</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Add Class
                </Button>
            </div>

            <Calendar dateCellRender={dateCellRender} mode="month" />

            <Modal
                title="Add New Class"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleAddClass} form={form}>
                    <Form.Item
                        name="day"
                        label="Day of Week"
                        rules={[{ required: true, message: 'Please select day' }]}
                    >
                        <Select>
                            <Option value="Monday">Monday</Option>
                            <Option value="Tuesday">Tuesday</Option>
                            <Option value="Wednesday">Wednesday</Option>
                            <Option value="Thursday">Thursday</Option>
                            <Option value="Friday">Friday</Option>
                            <Option value="Saturday">Saturday</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="subject"
                        label="Subject"
                        rules={[{ required: true, message: 'Please enter subject' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="teacher"
                        label="Teacher"
                        rules={[{ required: true, message: 'Please enter teacher name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="room"
                        label="Room Number"
                        rules={[{ required: true, message: 'Please enter room number' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Time Slot" style={{ marginBottom: 0 }}>
                        <Form.Item
                            name="startTime"
                            rules={[{ required: true, message: 'Start time' }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
                        >
                            <TimePicker format="HH:mm" placeholder="Start" />
                        </Form.Item>
                        <Form.Item
                            name="endTime"
                            rules={[{ required: true, message: 'End time' }]}
                            style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }}
                        >
                            <TimePicker format="HH:mm" placeholder="End" />
                        </Form.Item>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Add Class
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Timetable;
