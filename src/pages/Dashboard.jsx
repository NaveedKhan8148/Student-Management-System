import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    attendanceTrendByClass,
    resultComparisonSemesters,
    feeCollectionVsPending,
    performanceDistribution,
} from '../data/analytics';

const { Title, Paragraph } = Typography;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f'];

const Dashboard = () => {
    return (
        <div>
            <Title level={2}>Academic analytics dashboard</Title>
            <Paragraph type="secondary">
                Institutional summaries for decision support (static demo data — no live server).
            </Paragraph>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card className="hover-card" title="Attendance trends by class">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attendanceTrendByClass}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="className" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="week1" name="Week 1" fill="#8884d8" />
                                <Bar dataKey="week2" name="Week 2" fill="#82ca9d" />
                                <Bar dataKey="week3" name="Week 3" fill="#ffc658" />
                                <Bar dataKey="week4" name="Week 4" fill="#ff8042" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card className="hover-card" title="Result comparison across semesters">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={resultComparisonSemesters}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="semester" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="avgGpa" name="Avg GPA" stroke="#1890ff" />
                                <Line yAxisId="right" type="monotone" dataKey="passRate" name="Pass %" stroke="#52c41a" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card className="hover-card" title="Fee collection vs pending dues">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={feeCollectionVsPending}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="collected" name="Collected" fill="#52c41a" />
                                <Bar dataKey="pending" name="Pending" fill="#ff4d4f" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card className="hover-card" title="Performance distribution">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={performanceDistribution}
                                    dataKey="count"
                                    nameKey="range"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {performanceDistribution.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
