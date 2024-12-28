import api from "../config/axiosConfig";

export const initiateLogin = async (platform: "mobile" | "web") => {
    const baseUrl = "http://localhost:8000";
    return `${baseUrl}/api/auth/login?platform=${platform}`;
  };

export const fetchTokenFromCallback = async (code: string, state: string) => {
  const response = await api.get(`/auth/callback?code=${code}&state=${state}`);
  return response.data; // Contains access_token and id_token for mobile
};

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await api.post("/auth/jwt/refresh/", { refresh: refreshToken });
  return response.data.access; // Return the new access token
};
