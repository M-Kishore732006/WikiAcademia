import axios from 'axios';

const api = axios.create({
    // In production (Vercel), this reads VITE_API_URL from the Vercel dashboard.
    // In dev, it defaults to the local server.
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to add the token to the header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
