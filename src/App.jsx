// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import StudentLayout from './components/StudentLayout';
import TeacherLayout from './components/TeacherLayout';
import ParentLayout from './components/ParentLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Parents from './pages/Parents';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Timetable from './pages/Timetable';
import Results from './pages/Results';
import AcademicWarnings from './pages/AcademicWarnings';
import ApprovalWorkflows from './pages/ApprovalWorkflows';
import StudentTimetable from './pages/StudentTimetable';
import StudentAttendance from './pages/StudentAttendance';
import StudentFees from './pages/StudentFees';
import StudentResults from './pages/StudentResults';
import StudentNews from './pages/StudentNews';
import StudentProfile from './pages/StudentProfile';
import TeacherClasses from './pages/TeacherClasses';
import TeacherClassAttendance from './pages/TeacherClassAttendance';
import TeacherClassResults from './pages/TeacherClassResults';
import TeacherClassTimetable from './pages/TeacherClassTimetable';
import ParentOverview from './pages/ParentOverview';
import ParentAttendance from './pages/ParentAttendance';
import ParentFees from './pages/ParentFees';
import ParentResults from './pages/ParentResults';
import ParentTimetable from './pages/ParentTimetable';
import './App.css';

// Fixed RoleBasedRedirect component to prevent unnecessary re-renders
const RoleBasedRedirect = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { replace: true });
            return;
        }

        if (!loading && user) {
            // Determine redirect path based on role
            let redirectPath = '/dashboard';
            if (user.role === 'student') {
                redirectPath = '/student/timetable';
            } else if (user.role === 'teacher') {
                redirectPath = '/teacher/attendance';
            } else if (user.role === 'parent') {
                redirectPath = '/parent/overview';
            }
            
            // Use navigate instead of Navigate component to avoid re-renders
            navigate(redirectPath, { replace: true });
        }
    }, [user, loading, navigate]);

    // Show nothing while redirecting
    return null;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

// Separate component to use useAuth hook inside BrowserRouter
const AppRoutes = () => {
    const { user, loading } = useAuth();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh' 
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Root route - redirect based on auth status */}
            <Route 
                path="/" 
                element={
                    !user ? <Navigate to="/login" replace /> : <RoleBasedRedirect />
                } 
            />

            {/* Admin routes - only accessible by admin */}
            <Route
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="teachers" element={<Teachers />} />
                <Route path="parents" element={<Parents />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="fees" element={<Fees />} />
                <Route path="timetable" element={<Timetable />} />
                <Route path="results" element={<Results />} />
                <Route path="warnings" element={<AcademicWarnings />} />
                <Route path="approvals" element={<ApprovalWorkflows />} />
            </Route>

            {/* Teacher routes - only accessible by teacher */}
            <Route
                element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                        <TeacherLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="teacher" element={<Navigate to="/teacher/attendance" replace />} />
                <Route path="teacher/attendance" element={<TeacherClasses />} />
                <Route path="teacher/classes/:classKey/attendance" element={<TeacherClassAttendance />} />
                <Route path="teacher/classes/:classKey/results" element={<TeacherClassResults />} />
                <Route path="teacher/classes/:classKey/timetable" element={<TeacherClassTimetable />} />
            </Route>

            {/* Student routes - only accessible by student */}
            <Route
                element={
                    <ProtectedRoute allowedRoles={['student']}>
                        <StudentLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="student" element={<Navigate to="/student/timetable" replace />} />
                <Route path="student/profile" element={<StudentProfile />} />
                <Route path="student/timetable" element={<StudentTimetable />} />
                <Route path="student/attendance" element={<StudentAttendance />} />
                <Route path="student/fees" element={<StudentFees />} />
                <Route path="student/results" element={<StudentResults />} />
                <Route path="student/news" element={<StudentNews />} />
            </Route>

            {/* Parent routes - only accessible by parent */}
            <Route
                element={
                    <ProtectedRoute allowedRoles={['parent']}>
                        <ParentLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="parent" element={<Navigate to="/parent/overview" replace />} />
                <Route path="parent/overview" element={<ParentOverview />} />
                <Route path="parent/attendance" element={<ParentAttendance />} />
                <Route path="parent/fees" element={<ParentFees />} />
                <Route path="parent/results" element={<ParentResults />} />
                <Route path="parent/timetable" element={<ParentTimetable />} />
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default App;