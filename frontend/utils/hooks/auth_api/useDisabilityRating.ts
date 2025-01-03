import { useQuery, UseQueryResult } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Type definition for individual ratings
type IndividualRating = {
    decision: string;
    disability_rating_id: string;
    effective_date: string;
    rating_end_date: string;
    rating_percentage: number;
    diagnostic_type_code: string;
    hyph_diagnostic_type_code: string;
    diagnostic_type_name: string;
    diagnostic_text: string;
    static_ind: boolean;
  };
  
  // Type definition for the attributes
  type DisabilityRatingAttributes = {
    combined_disability_rating: number;
    combined_effective_date: string;
    legal_effective_date: string;
    individual_ratings: IndividualRating[];
  };
  
  // Type definition for the main response data
  type DisabilityRatingResponse = {
    disability_rating: {
      data: {
        id: string;
        type: string;
        attributes: DisabilityRatingAttributes;
      };
    };
  };
  
// Fetch function to get disability rating
const fetchDisabilityRating = async (): Promise<DisabilityRatingResponse> => {
  
    let accessToken;
  
    try {
      accessToken = await AsyncStorage.getItem('access_token');
    } catch (error) {

    }
  
    const response = await fetch('http://localhost:8000/api/auth/disability-rating/', {
      method: 'GET',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch disability rating');
    }
  
    const data = await response.json();
  
    return data;
  };
  

type UseDisabilityRatingResult = UseQueryResult<DisabilityRatingResponse>;

// Hook for fetching disability rating
export const useDisabilityRating = (): UseDisabilityRatingResult => {
  console.log('useDisabilityRating Hook Triggered');
  return useQuery<DisabilityRatingResponse>({
    queryKey: ['disabilityRating'], 
    queryFn: fetchDisabilityRating, 
    staleTime: 5 * 60 * 1000, 
    retry: 1, 
  });
};