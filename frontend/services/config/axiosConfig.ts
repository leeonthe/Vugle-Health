import axios from "axios";
import * as SecureStore from "expo-secure-store";
import jwtDecode from "jwt-decode"; // For decoding JWT tokens
import { useDevice } from "../../utils/hooks/useDevice"; // Ensure correct path

// Utility function to check token expiry
const isTokenExpired = (token: string) => {
  try {
    const { exp } = (jwtDecode as any)(token); // Decode token
    return Date.now() >= exp * 1000; // Compare expiration time
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Treat invalid tokens as expired
  }
};

// Function to refresh the JWT token
const refreshJwtToken = async () => {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await axios.post("http://localhost:8000/api/token/refresh/", { refresh: refreshToken });
    const newAccessToken = response.data.access;

    // Store the new token in SecureStore
    await SecureStore.setItemAsync("jwt_token", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);

    // Clear tokens and handle login redirection if refresh fails
    await SecureStore.deleteItemAsync("jwt_token");
    await SecureStore.deleteItemAsync("refreshToken");
    return null;
  }
};

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api", // Base API URL
  withCredentials: true, // Required for session-based authentication (web)
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  const { isMobile } = useDevice();
  let token = await SecureStore.getItemAsync("jwt_token");

  if (isMobile) {
    // Refresh token if expired
    if (token && isTokenExpired(token)) {
      token = await refreshJwtToken();
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } else {
    // CSRF token handling for web
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]')?.value;

    if (!csrfToken) {
      const response = await axios.get("http://localhost:8000/api/csrf/");
      config.headers["X-CSRFToken"] = response.data.csrfToken;
    } else {
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { isMobile } = useDevice();

    if (isMobile && error.response?.status === 401) {
      // Handle token refresh for mobile clients
      const newToken = await refreshJwtToken();

      if (newToken) {
        error.config.headers["Authorization"] = `Bearer ${newToken}`;
        return api.request(error.config); // Retry failed request
      }
    } else if (!isMobile && error.response?.status === 403) {
      // Handle CSRF refresh for web clients
      const response = await api.get("/csrf-token");
      error.config.headers["X-CSRFToken"] = response.data.csrfToken;
      return api.request(error.config);
    }

    return Promise.reject(error);
  }
);

export default api;
