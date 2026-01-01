import axios from 'axios';

const API_BASE = '/.netlify/functions';

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authApi = {
    signup: async (email, password, name) => {
        const response = await axios.post(`${API_BASE}/auth`, { action: 'signup', email, password, name });
        return response.data;
    },
    login: async (email, password) => {
        const response = await axios.post(`${API_BASE}/auth`, { action: 'login', email, password });
        return response.data;
    }
};

export const galleryApi = {
    getPrivate: async () => {
        const response = await axios.get(`${API_BASE}/gallery`, { headers: getAuthHeaders() });
        return response.data;
    },
    getPublic: async () => {
        const response = await axios.get(`${API_BASE}/gallery?visibility=public`);
        return response.data;
    },
    upload: async (itemData) => {
        const response = await axios.post(`${API_BASE}/gallery`, itemData, { headers: getAuthHeaders() });
        return response.data;
    },
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE}/gallery?id=${id}`, { headers: getAuthHeaders() });
        return response.data;
    },
    togglePublic: async (id, isPublic) => {
        const response = await axios.patch(`${API_BASE}/gallery`, { id, isPublic }, { headers: getAuthHeaders() });
        return response.data;
    }
};

export const promptsApi = {
    get: async () => {
        const response = await axios.get(`${API_BASE}/prompts`, { headers: getAuthHeaders() });
        return response.data;
    },
    save: async (content, refinedTags) => {
        const response = await axios.post(`${API_BASE}/prompts`, { content, refinedTags }, { headers: getAuthHeaders() });
        return response.data;
    },
    delete: async (id) => {
        const response = await axios.delete(`${API_BASE}/prompts?id=${id}`, { headers: getAuthHeaders() });
        return response.data;
    }
};
