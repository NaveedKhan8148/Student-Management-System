// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const logoutInProgress = useRef(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Normalize role to lowercase for consistency
                if (parsedUser.role) {
                    parsedUser.role = parsedUser.role.toLowerCase();
                }
                setUser(parsedUser);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error('Error parsing stored user:', error);
                clearAuthData();
            }
        }
        setLoading(false);
    }, []);

    const clearAuthData = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/api/v1/users/login', { email, password });
            const { user, accessToken, refreshToken } = res.data.data;
            
            if (user.status === 'INACTIVE') {
                return {
                    ok: false,
                    message: 'Your account is inactive. Please contact administrator.'
                };
            }
            
            // Normalize role to lowercase
            const normalizedUser = {
                ...user,
                role: user.role?.toLowerCase()
            };
            
            setUser(normalizedUser);
            localStorage.setItem('user', JSON.stringify(normalizedUser));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            return { ok: true, role: normalizedUser.role };
        } catch (error) {
            console.error('Login error:', error);
            return {
                ok: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = useCallback(async () => {
        // Prevent multiple logout calls
        if (logoutInProgress.current) {
            console.log('Logout already in progress, skipping...');
            return;
        }
        
        logoutInProgress.current = true;
        
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                // Call logout API but don't await it to prevent blocking
                axios.post('/api/v1/users/logout', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(err => console.error('Logout API error:', err));
            }
        } finally {
            // Clear data immediately
            clearAuthData();
            logoutInProgress.current = false;
        }
    }, [clearAuthData]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};