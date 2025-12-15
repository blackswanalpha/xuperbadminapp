import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://xuperb.spinwish.tech/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the auth token if available
api.interceptors.request.use(
    (config) => {
        // Try multiple token keys for compatibility
        let token = typeof window !== 'undefined' ? 
            localStorage.getItem('access_token') || 
            localStorage.getItem('token') || 
            localStorage.getItem('authToken') : null;

        // Note: For production, tokens should be obtained through proper login flow
        // The admin app will need to authenticate with the backend first

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