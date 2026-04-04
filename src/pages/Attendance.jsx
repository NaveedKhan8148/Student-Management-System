import React, { useState, useEffect } from 'react';
import { Table, Button, DatePicker, Radio, message, Card, Typography, Space, Tabs, Row, Col, Statistic, Input } from 'antd';
import { SaveOutlined, PieChartOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { studentsData } from '../data/students';

const { Title } = Typography;

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [attendance, setAttendance] = useState({});
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const initialAttendance = {};
    studentsData.forEach((student) => {
      initialAttendance[student.id] = 'Present';
    });
    setAttendance(initialAttendance);
  }, []);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    console.log('Saving attendance for', selectedDate.format('YYYY-MM-DD'), attendance);
    message.success(`Attendance saved for ${selectedDate.format('YYYY-MM-DD')}`);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Radio.Group
          value={attendance[record.id] || 'Present'}
          onChange={(e) => handleStatusChange(record.id, e.target.value)}
        >
          <Radio.Button value="Present" style={{ color: 'green' }}>Present</Radio.Button>
          <Radio.Button value="Absent" style={{ color: 'red' }}>Absent</Radio.Button>
        </Radio.Group>
      ),
    },
  ];

  // Mock data for the chart
  const chartData = [
    { name: 'Mon', Present: 40, Absent: 5 },
    { name: 'Tue', Present: 42, Absent: 3 },
    { name: 'Wed', Present: 38, Absent: 8 },
    { name: 'Thu', Present: 45, Absent: 2 },
    { name: 'Fri', Present: 41, Absent: 4 },
  ];

  // Filter students based on search text
  const filteredStudents = studentsData.filter(student => {
    const search = searchText.trim().toLowerCase();
    return !search || [student.id, student.studentName, student.class].some(field =>
      field?.toString().toLowerCase().includes(search)
    );
  });

  const items = [
    {
      key: '1',
      label: 'Mark Attendance',
      children: (
        <div>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Title level={4} style={{ margin: 0 }}>Mark Attendance</Title>
              <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                format="YYYY-MM-DD"
              />
            </Space>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveAttendance}>
              Save Attendance
            </Button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input.Search
              placeholder="Search by ID, name, or program"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
              style={{ width: 300 }}
            />
          </div>
          <Card className="hover-card">
            <Table
              dataSource={filteredStudents}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`,
              }}
              rowKey="id"
            />
          </Card>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Reports & Analytics',
      children: (
        <div>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card className="hover-card">
                <Statistic
                  title="Average Attendance"
                  value={85}
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                  suffix="%"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="hover-card">
                <Statistic
                  title="Total Absences (This Month)"
                  value={12}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="hover-card">
                <Statistic
                  title="Present (This Month)"
                  value={85}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>
          <Card className="hover-card" title="Weekly Attendance Trends">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Present" fill="#52c41a" />
                <Bar dataKey="Absent" fill="#ff4d4f" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default Attendance;
