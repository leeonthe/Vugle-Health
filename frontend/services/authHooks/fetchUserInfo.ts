
import api from "../config/axiosConfig"; // Ensure the correct path to your axiosConfig.ts
import * as SecureStore from "expo-secure-store";

type UserInfoResponse = {
  given_name: string;
};

const fetchUserInfo = async (): Promise<UserInfoResponse> => {
  console.log("Attempting to fetch user info...");
  let idToken;

  try {
    idToken = await SecureStore.getItemAsync("id_token");
    console.log("ID Token Retrieved in useUserFirstName.ts:", idToken);
  } catch (error) {
    console.error("Error retrieving ID token:", error);
  }

  try {
    // Use the `api` instance
    const response = await api.get("/auth/user-info/", {
      headers: {
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
    });

    const data = response.data;
    console.log("User Info Response:", data);
    return { given_name: data.user_info.given_name };
  } catch (error: any) {
    console.error("Error fetching user info:", error.response?.data || error);
    throw new Error("Failed to fetch user info");
  }
};

export default fetchUserInfo;