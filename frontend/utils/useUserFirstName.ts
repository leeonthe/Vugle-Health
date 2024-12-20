import { useQuery, UseQueryResult } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the response structure
type UserInfoResponse = {
  given_name: string;
};

const fetchUserInfo = async (): Promise<UserInfoResponse> => {
  console.log('Attempting to fetch user info...');
  let accessToken;

  try {
    accessToken = await AsyncStorage.getItem('access_token'); // Retrieve token securely
    console.log('Access Token Retrieved:', accessToken);
  } catch (error) {
    console.error('Error retrieving access token:', error);
  }

  const response = await fetch('http://localhost:8000/api/auth/user-info/', {
    method: 'GET',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    console.error('Error response:', await response.text());
    throw new Error('Failed to fetch user info');
  }

  const data = await response.json();
  console.log('User Info Response:', data);
  return { given_name: data.user_info.given_name };
};


// Hook for fetching user's first name
export const useUserFirstName = (): UseQueryResult<UserInfoResponse> => {
  console.log('useUserFirstName Hook Triggered');
  return useQuery<UserInfoResponse>({
    queryKey: ['userFirstName'], // Unique key for caching
    queryFn: fetchUserInfo, // The async function to fetch user info
    staleTime: 5 * 60 * 1000, // Cache the data for 5 minutes
    retry: 1, // Retry once on failure
  });
};
