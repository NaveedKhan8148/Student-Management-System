import React, { useState, useEffect } from 'react';
import {
    Calendar, Badge, Modal, Form, Input, Select, Button,
    message, Table, Tag, Space, Popconfirm, Card, Row, Col, Spin
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { Option } = Select;

const TIME_SLOTS = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
];

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = () => {
    const [timetable, setTimetable] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [view, setView] = useState('table'); // 'table' | 'calendar'
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchTimetable(selectedClass);
        } else {
            setTimetable([]);
        }
    }, [selectedClass]);

    // ── Fetch helpers ─────────────────────────────────────────────────────────
    const fetchClasses = async () => {
        try {
            const res = await axios.get('/api/v1/classes/');
            setClasses(res.data.data);
        } catch {
            message.error('Failed to fetch classes');
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await axios.get('/api/v1/teachers/');
            setTeachers(res.data.data);
        } catch {
            message.error('Failed to fetch teachers');
        }
    };

    const fetchTimetable = async (classId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/timetable/class/${classId}`);
            setTimetable(res.data.data);
        } catch {
            message.error('Failed to fetch timetable');
        } finally {
            setLoading(false);
        }
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleCreate = async (values) => {
        setSubmitLoading(true);
        try {
            await axios.post('/api/v1/timetable/', {
                classId: selectedClass,
                teacherId: values.teacherId,
                dayOfWeek: values.dayOfWeek,
                timeSlot: values.timeSlot,
                subject: values.subject,
                roomLocation: values.roomLocation,
            });
            message.success('Timetable entry created');
            setIsModalVisible(false);
            form.resetFields();
            fetchTimetable(selectedClass);
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to create entry');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditOpen = (record) => {
        setEditingEntry(record);
        editForm.setFieldsValue({
            teacherId: record.teacherId?._id,
            dayOfWeek: record.dayOfWeek,
            timeSlot: record.timeSlot,
            subject: record.subject,
            roomLocation: record.roomLocation,
        });
        setIsEditModalVisible(true);
    };

    const handleEditSave = async (values) => {
        setSubmitLoading(true);
        try {
            await axios.patch(`/api/v1/timetable/${editingEntry._id}`, {
                teacherId: values.teacherId,
                dayOfWeek: values.dayOfWeek,
                timeSlot: values.timeSlot,
                subject: values.subject,
                roomLocation: values.roomLocation,
            });
            message.success('Timetable entry updated');
            setIsEditModalVisible(false);
            editForm.resetFields();
            setEditingEntry(null);
            fetchTimetable(selectedClass);
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to update entry');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/v1/timetable/${id}`);
            message.success('Entry deleted');
            fetchTimetable(selectedClass);
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to delete entry');
        }
    };

    // ── Table view columns ────────────────────────────────────────────────────
    const columns = [
        {
            title: 'Day',
            dataIndex: 'dayOfWeek',
            key: 'dayOfWeek',
            sorter: (a, b) =>
                DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
            render: (day) => <Tag color="blue">{day}</Tag>,
        },
        {
            title: 'Time Slot',
            dataIndex: 'timeSlot',
            key: 'timeSlot',
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Teacher',
            key: 'teacher',
            render: (_, record) => record.teacherId?.name || '-',
        },
        {
            title: 'Room',
            dataIndex: 'roomLocation',
            key: 'roomLocation',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditOpen(record)}
                    />
                    <Popconfirm
                        title="Delete this timetable entry?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // ── Calendar cell render ──────────────────────────────────────────────────
    const dateCellRender = (value) => {
        const dayName = value.format('dddd');
        const entries = timetable.filter((t) => t.dayOfWeek === dayName);
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {entries.map((item) => (
                    <li key={item._id}>
                        <Badge
                            status="success"
                            text={
                                <span style={{ fontSize: 11 }}>
                                    {item.timeSlot} {item.subject} ({item.roomLocation})
                                </span>
                            }
                        />
                    </li>
                ))}
            </ul>
        );
    };

    // ── Weekly grid view ──────────────────────────────────────────────────────
    const WeeklyGrid = () => (
        <Row gutter={[8, 8]}>
            {DAY_ORDER.map((day) => {
                const dayEntries = timetable
                    .filter((t) => t.dayOfWeek === day)
                    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

                return (
                    <Col xs={24} sm={12} lg={8} xl={4} key={day}>
                        <Card
                            size="small"
                            title={<span style={{ fontWeight: 700 }}>{day}</span>}
                            style={{ minHeight: 200 }}
                            headStyle={{ backgroundColor: '#f0f5ff', borderBottom: '2px solid #1890ff' }}
                        >
                            {dayEntries.length === 0 ? (
                                <div style={{ color: '#bbb', fontSize: 12, textAlign: 'center', paddingTop: 16 }}>
                                    No classes
                                </div>
                            ) : (
                                dayEntries.map((entry) => (
                                    <div
                                        key={entry._id}
                                        style={{
                                            background: '#e6f7ff',
                                            border: '1px solid #91d5ff',
                                            borderRadius: 6,
                                            padding: '6px 8px',
                                            marginBottom: 6,
                                            fontSize: 12,
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, color: '#1890ff' }}>
                                            {entry.subject}
                                        </div>
                                        <div style={{ color: '#555' }}>{entry.timeSlot}</div>
                                        <div style={{ color: '#888' }}>
                                            {entry.teacherId?.name || '-'}
                                        </div>
                                        <div style={{ color: '#aaa' }}>{entry.roomLocation}</div>
                                        <Space size={4} style={{ marginTop: 4 }}>
                                            <Button
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => handleEditOpen(entry)}
                                            />
                                            <Popconfirm
                                                title="Delete?"
                                                onConfirm={() => handleDelete(entry._id)}
                                                okButtonProps={{ danger: true }}
                                            >
                                                <Button size="small" danger icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        </Space>
                                    </div>
                                ))
                            )}
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );

    // ── Shared form fields ────────────────────────────────────────────────────
    const TimetableFormFields = () => (
        <>
            <Form.Item
                name="dayOfWeek"
                label="Day of Week"
                rules={[{ required: true, message: 'Please select day' }]}
            >
                <Select placeholder="Select day">
                    {DAY_ORDER.map((d) => (
                        <Option key={d} value={d}>{d}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="timeSlot"
                label="Time Slot"
                rules={[{ required: true, message: 'Please select time slot' }]}
            >
                <Select placeholder="Select time slot">
                    {TIME_SLOTS.map((t) => (
                        <Option key={t} value={t}>{t}</Option>
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
                name="teacherId"
                label="Teacher"
                rules={[{ required: true, message: 'Please select teacher' }]}
            >
                <Select
                    placeholder="Select teacher"
                    showSearch
                    optionFilterProp="children"
                >
                    {teachers.map((t) => (
                        <Option key={t._id} value={t._id}>
                            {t.name} — {t.subject}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="roomLocation"
                label="Room / Location"
                rules={[{ required: true, message: 'Please enter room' }]}
            >
                <Input placeholder="e.g. Room 101" />
            </Form.Item>
        </>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div>
            {/* ── Top bar ── */}
            <div style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
            }}>
                <h2 style={{ margin: 0 }}>Weekly Timetable</h2>
                <Space wrap>
                    <Select
                        placeholder="Select class"
                        style={{ width: 180 }}
                        onChange={(val) => setSelectedClass(val)}
                        value={selectedClass}
                        allowClear
                    >
                        {classes.map((cls) => (
                            <Option key={cls._id} value={cls._id}>{cls.name}</Option>
                        ))}
                    </Select>

                    <Select
                        value={view}
                        onChange={setView}
                        style={{ width: 130 }}
                    >
                        <Option value="table">Table View</Option>
                        <Option value="grid">Weekly Grid</Option>
                        <Option value="calendar">Calendar</Option>
                    </Select>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => selectedClass && fetchTimetable(selectedClass)}
                        disabled={!selectedClass}
                    >
                        Refresh
                    </Button>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                        disabled={!selectedClass}
                    >
                        Add Entry
                    </Button>
                </Space>
            </div>

            {/* ── No class selected ── */}
            {!selectedClass && (
                <Card>
                    <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                        Please select a class to view its timetable
                    </div>
                </Card>
            )}

            {/* ── Table view ── */}
            {selectedClass && view === 'table' && (
                <Table
                    columns={columns}
                    dataSource={timetable}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (t) => `Total ${t} entries`,
                    }}
                />
            )}

            {/* ── Weekly grid view ── */}
            {selectedClass && view === 'grid' && (
                loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <WeeklyGrid />
                )
            )}

            {/* ── Calendar view ── */}
            {selectedClass && view === 'calendar' && (
                loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Calendar cellRender={dateCellRender} mode="month" />
                )
            )}

            {/* ── Create Modal ── */}
            <Modal
                title="Add Timetable Entry"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleCreate} form={form}>
                    <TimetableFormFields />
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={submitLoading}>
                            Add Entry
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal
                title="Edit Timetable Entry"
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    editForm.resetFields();
                    setEditingEntry(null);
                }}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleEditSave} form={editForm}>
                    <TimetableFormFields />
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={submitLoading}>
                            Update Entry
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Timetable;