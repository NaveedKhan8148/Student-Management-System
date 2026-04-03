import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const RoleBasedRedirect = () => {
    const { user } = useAuth();
    if (user?.role === 'student') {
        return <Navigate to="/student/timetable" replace />;
    }
    if (user?.role === 'teacher') {
        return <Navigate to="/teacher/attendance" replace />;
    }
    if (user?.role === 'parent') {
        return <Navigate to="/parent/overview" replace />;
    }
    return <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <MainLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<RoleBasedRedirect />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="students" element={<Students />} />
                        <Route path="teachers" element={<Teachers />} />
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="fees" element={<Fees />} />
                        <Route path="timetable" element={<Timetable />} />
                        <Route path="results" element={<Results />} />
                        <Route path="warnings" element={<AcademicWarnings />} />
                        <Route path="approvals" element={<ApprovalWorkflows />} />
                    </Route>

                    <Route
                        path="/teacher"
                        element={
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<TeacherClasses />} />
                        {/* Backwards-compatible teacher landing route (keep existing flow) */}
                        <Route path="attendance" element={<TeacherClasses />} />
                        <Route path="classes/:classKey/attendance" element={<TeacherClassAttendance />} />
                        <Route path="classes/:classKey/results" element={<TeacherClassResults />} />
                        <Route path="classes/:classKey/timetable" element={<TeacherClassTimetable />} />
                    </Route>

                    <Route
                        path="/student"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="timetable" replace />} />
                        <Route path="profile" element={<StudentProfile />} />
                        <Route path="timetable" element={<StudentTimetable />} />
                        <Route path="attendance" element={<StudentAttendance />} />
                        <Route path="fees" element={<StudentFees />} />
                        <Route path="results" element={<StudentResults />} />
                        <Route path="news" element={<StudentNews />} />
                    </Route>

                    <Route
                        path="/parent"
                        element={
                            <ProtectedRoute allowedRoles={['parent']}>
                                <ParentLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<ParentOverview />} />
                        <Route path="attendance" element={<ParentAttendance />} />
                        <Route path="fees" element={<ParentFees />} />
                        <Route path="results" element={<ParentResults />} />
                        <Route path="timetable" element={<ParentTimetable />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
