import axios from 'axios';

// Fetch CSRF token
const fetchCSRFToken = async () => {
  const response = await axios.get('http://localhost:8000/api/csrf/');
  return response.data.csrfToken;
};

// Axios instance with CSRF token
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
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
