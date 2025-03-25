import axios from 'axios';

// Tạo instance của axios với base URL của backend
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Thay bằng URL của backend (cổng mà server.js chạy)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động gắn token vào header (nếu có)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;