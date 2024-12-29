import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Custom hook for making authenticated requests
export const useAuthenticatedRequest = () => {
  const makeRequest = async (
    url: string,
    data: object,
    method: 'POST' | 'GET' = 'POST'
  ): Promise<any> => {
    const accessToken = await AsyncStorage.getItem('access_token');

    try {
      const response = await axios({
        url,
        method,
        data: method === 'POST' ? data : undefined,
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        withCredentials: true, // Include cookies for session persistence
      });

      if (response.status === 200) {
        console.log(`Request to ${url} successful:`, response.data);
        return response.data;
      } else {
        console.error(`Unexpected response from ${url}:`, response);
        throw new Error('Unexpected response');
      }
    } catch (error) {
      console.error(`Error making request to ${url}:`, error);
      throw error;
    }
  };

  return { makeRequest };
};
