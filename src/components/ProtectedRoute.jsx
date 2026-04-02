import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const homeByRole = {
    admin: '/dashboard',
    teacher: '/teacher/attendance',
    student: '/student/timetable',
    parent: '/parent/overview',
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, logout } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Role mismatch: clear session so Login page doesn't immediately redirect back
        // to the current (unauthorized) role homepage.
        if (typeof logout === 'function') logout();
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
