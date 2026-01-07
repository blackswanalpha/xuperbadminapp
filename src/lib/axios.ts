import axios from 'axios';

const api = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'https://xuperb.spinwish.tech/api/v1').replace(/\/?$/, '/'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the auth token if available
api.interceptors.request.use(
    (config) => {
        let token: string | null = null;

        if (typeof window !== 'undefined') {
            // 1. Support Zustand auth-storage (Highest Priority)
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                try {
                    const parsed = JSON.parse(authStorage);
                    token = parsed.state?.token;
                    if (token) {
                        console.log('[Axios] Using token from auth-storage');
                    }
                } catch (e) {
                    console.error('[Axios] Error parsing auth-storage:', e);
                }
            }

            // 2. Fallback to legacy token keys for compatibility
            if (!token) {
                token = localStorage.getItem('access_token') ||
                    localStorage.getItem('token') ||
                    localStorage.getItem('authToken');
                if (token) {
                    console.log('[Axios] Using legacy fallback token');
                }
            }
        }

        // Don't attach token for login/register endpoints
        const isAuthRequest = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

        if (token && !isAuthRequest) {
            config.headers.Authorization = `Bearer ${token.trim()}`;
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
            // Handle unauthorized access - clear auth and redirect to login
            console.error('[Axios] Unauthorized access (401). Clearing state.');

            if (typeof window !== 'undefined') {
                // Clear all possible auth data
                const keysToRemove = [
                    'auth-storage',
                    'token',
                    'access_token',
                    'authToken',
                    'user',
                    'rememberMeExpiry'
                ];

                keysToRemove.forEach(key => localStorage.removeItem(key));

                // Don't redirect if already on login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login?reason=session_expired';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;