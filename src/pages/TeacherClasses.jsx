import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'antd';
import { teacherClassCards } from '../data/teacherClassCards';

const TeacherClasses = () => {
    const navigate = useNavigate();

    return (
        <div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))',
                    gap: 18,
                    alignItems: 'stretch',
                }}
            >
                {teacherClassCards.map((cls) => (
                    <Card
                        key={cls.key}
                        hoverable
                        style={{
                            border: '3px solid #000',
                            borderRadius: 2,
                            cursor: 'pointer',
                            padding: 12,
                            textAlign: 'center',
                        }}
                        onClick={() => navigate(`/teacher/classes/${cls.key}/attendance`)}
                    >
                        <div style={{ fontWeight: 600 }}>{cls.label}</div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TeacherClasses;

