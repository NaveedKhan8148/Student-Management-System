import React, { createContext, useState, useContext, useEffect } from 'react';
import { studentsData } from '../data/students';
import { teachersData } from '../data/teachers';
import { parentsData } from '../data/parents';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        if (username === 'admin' && password === 'admin') {
            const userData = { username: 'Admin', role: 'admin' };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { ok: true, role: 'admin' };
        }

        const teacher = teachersData.find((t) => t.email === username && t.password === password);
        if (teacher) {
            const userData = {
                username: teacher.name,
                email: teacher.email,
                role: 'teacher',
                teacherId: teacher.id,
                assignedPrograms: teacher.assignedPrograms,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { ok: true, role: 'teacher' };
        }

        const parent = parentsData.find((p) => p.email === username && p.password === password);
        if (parent) {
            const userData = {
                username: parent.name,
                email: parent.email,
                role: 'parent',
                parentId: parent.id,
                childStudentId: parent.childStudentId,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { ok: true, role: 'parent' };
        }

        const student = studentsData.find((s) => s.email === username && s.password === password);
        if (student) {
            const userData = {
                username: student.name,
                email: student.email,
                role: 'student',
                studentId: student.id,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { ok: true, role: 'student' };
        }

        return { ok: false };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
