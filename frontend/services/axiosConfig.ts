import axios from 'axios';

// Fetch CSRF token
const fetchCSRFToken = async () => {
  const response = await axios.get('https://vugle-backend-v1.com/api/csrf/');
  return response.data.csrfToken;
};

// Axios instance with CSRF token
const api = axios.create({
  baseURL: 'https://vugle-backend-v1.com/api/',
  withCredentials: true, // Include cookies in requests
});

api.interceptors.request.use(async (config) => {
  if (!config.headers['X-CSRFToken']) {
    const csrfToken = await fetchCSRFToken();
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export default api;
