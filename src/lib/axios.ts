import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the auth token if available
api.interceptors.request.use(
    (config) => {
        // TODO: Get token from storage/session
        let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        // For development: if no token exists, use a default admin token
        if (!token && typeof window !== 'undefined') {
            // This is a temporary development token - replace with proper login flow
            token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY0OTE5MTA3LCJpYXQiOjE3NjQ4MzI3MDcsImp0aSI6ImI0N2E4ZjE1NGQ1ZjRkYWViNWQ5MTZkOGZmNzdkYzRhIiwidXNlcl9pZCI6MX0.OuVTUVmhkxWN_dalsIw_N0wd0XL19qGyIquIv7xpitY';
            localStorage.setItem('token', token);
        }

        // Don't attach token for login/register endpoints
        if (token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            if (typeof window !== 'undefined') {
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;