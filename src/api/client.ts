import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL
// For Android emulator: 'http://10.0.2.2:8000/api/'
// For physical device: 'http://<your-computer-ip>:8000/api/'
const BASE_URL = 'http://10.251.50.66:8000/api/';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      // Adjust the header format based on your backend (Bearer or Token)
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh (optional but recommended)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}auth/refresh/`, {
            refresh: refreshToken,
          });
          const { access_token } = response.data;
          await AsyncStorage.setItem('access_token', access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed – clear tokens and redirect to login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // Optionally, trigger a global logout (e.g., via event emitter)
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;