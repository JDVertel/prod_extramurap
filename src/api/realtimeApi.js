import axios from 'axios';

const realtimeApi = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || '/api'}/realtime`,
    headers: {
        'Content-Type': 'application/json'
    }
});

realtimeApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

realtimeApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('uid');
            localStorage.removeItem('userData');
            window.location.href = '/login';
            return Promise.reject(new Error('Token expirado. Por favor inicia sesión nuevamente.'));
        }

        return Promise.reject(error);
    }
);

export default realtimeApi;
