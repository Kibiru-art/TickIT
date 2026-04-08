// src/services/api.ts (updated with profile API)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.137.101/api';  // <-- use YOUR actual IP

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken });
          const newAccessToken = response.data.access;
          await AsyncStorage.setItem('access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        console.warn('Token refresh failed');
      }
    }
    return Promise.reject(error);
  }
);

const getCurrentUser = async () => {
  const response = await api.get('/auth/me/');
  return response.data;
};

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login/`, { username, password });
    console.log('Login response:', response.data);
    const { access, refresh } = response.data;
    await AsyncStorage.setItem('access_token', access);
    if (refresh) await AsyncStorage.setItem('refresh_token', refresh);
    const user = await getCurrentUser();
    return { user };
  },

  register: async (userData: any) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      specialty: userData.specialty,
    });
    const { access, refresh } = response.data;
    if (access) await AsyncStorage.setItem('access_token', access);
    if (refresh) await AsyncStorage.setItem('refresh_token', refresh);
    const user = await getCurrentUser();
    return { user };
  },

  getCurrentUser: async () => {
    return await getCurrentUser();
  },

  logout: async (refreshToken: string) => {
    await axios.post(`${API_BASE_URL}/auth/logout/`, { refresh: refreshToken });
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
  },
};

export const ticketAPI = {
  getAllTickets: async () => {
    const response = await api.get('/tickets/');
    return response.data;
  },
  getMyTickets: async () => ticketAPI.getAllTickets(),
  getTicket: async (id: number) => {
    const response = await api.get(`/tickets/${id}/`);
    return response.data;
  },
  createTicket: async (ticketData: any) => {
    const response = await api.post('/tickets/', ticketData);
    return response.data;
  },
  updateTicketStatus: async (id: number, status: string) => {
    const response = await api.patch(`/tickets/${id}/update_status/`, { status });
    return response.data;
  },
  deleteTicket: async (id: number) => {
    await api.delete(`/tickets/${id}/`);
  },
  uploadAttachments: async (ticketId: number, formData: FormData) => {
    const response = await api.post(`/tickets/${ticketId}/attachments/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ======================= NEW PROFILE API =======================
export const profileAPI = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/profile/');
    return response.data;
  },

  // Update profile (name, phone, specialty, etc.)
  updateProfile: async (profileData: { name?: string; phone?: string; specialty?: string }) => {
    const response = await api.patch('/profile/', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post('/profile/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Change email
  changeEmail: async (newEmail: string, password: string) => {
    const response = await api.post('/profile/change-email/', {
      new_email: newEmail,
      password: password,
    });
    return response.data;
  },
};

export default api;