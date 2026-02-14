import axios from 'axios';

const getBaseURL = (): string => {
  const serverUrl = localStorage.getItem('SERVER_URL');
  return serverUrl ? `http://${serverUrl}/api` : '/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
