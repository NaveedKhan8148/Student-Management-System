import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on app load
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            // Set default axios header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('/api/v1/users/login', {
                email: username, // username field contains email
                password: password
            });

            if (response.data.success && response.data.data) {
                const { user: userData, accessToken, refreshToken } = response.data.data;
                
                // Transform user data to match the expected format in your app
                const transformedUser = {
                    _id: userData._id,
                    username: userData.username,
                    email: userData.email,
                    role: userData.role.toLowerCase(), // Convert to lowercase for consistency
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt
                };

                // Store tokens and user data
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(transformedUser));
                
                // Set default axios header for future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                // Update state
                setUser(transformedUser);
                
                return { ok: true, role: transformedUser.role };
            } else {
                return { ok: false, message: response.data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.response) {
                // Server responded with error status
                return { 
                    ok: false, 
                    message: error.response.data.message || 'Invalid email or password' 
                };
            } else if (error.request) {
                // Request was made but no response
                return { 
                    ok: false, 
                    message: 'Unable to connect to server. Please check your connection.' 
                };
            } else {
                // Something else happened
                return { 
                    ok: false, 
                    message: 'An error occurred. Please try again.' 
                };
            }
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    // Optional: Function to refresh token
    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return null;

            const response = await axios.post('http://localhost:8000/api/v1/users/refresh-token', {
                refreshToken: refreshToken
            });

            if (response.data.success && response.data.data.accessToken) {
                const newAccessToken = response.data.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                return newAccessToken;
            }
            return null;
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout(); // Log out if refresh fails
            return null;
        }
    };

    // Add axios interceptor to handle token expiration
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                // If error is 401 (Unauthorized) and we haven't tried to refresh yet
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        const newToken = await refreshAccessToken();
                        if (newToken) {
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        // If refresh fails, log out user
                        logout();
                    }
                }
                
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on component unmount
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);