import { useQuery, UseQueryResult } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserInfoResponse = {
  given_name: string;
  family_name: string;
};

const fetchUserInfo = async (): Promise<UserInfoResponse> => {
  console.log('Attempting to fetch user info...');
  let idToken;

  try {
    idToken = await AsyncStorage.getItem('id_token');
  } catch (error) {
    console.error('Error retrieving ID token:', error);
  }

  const response = await fetch('https://vugle-backend-v1.com/api/auth/user-info/', {
    method: 'GET',
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const data = await response.json();
  return { given_name: data.user_info.given_name, family_name: data.user_info.family_name };
};



// Hook for fetching user's first name
export const useUserFirstName = (): UseQueryResult<UserInfoResponse> => {
  console.log('useUserFirstName Hook Triggered');
  return useQuery<UserInfoResponse>({
    queryKey: ['userFirstName'], 
    queryFn: fetchUserInfo, 
    staleTime: 5 * 60 * 1000, 
    retry: 1, 
  });
};
