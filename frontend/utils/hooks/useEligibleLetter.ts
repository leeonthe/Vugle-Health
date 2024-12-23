import { useQuery, UseQueryResult } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type definitions for the eligible letters API response
type Message = {
  key: string;
  text: string;
  severity: string;
};

type Letter = {
  letterName: string;
  letterType: string;
};

type LetterDestination = {
  country: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  city: string;
  state: string;
  zipCode: string;
  fullName: string;
};

type MilitaryService = {
  branch: string;
  characterOfService: string;
  releasedDateTime: string;
  enteredDateTime: string;
};

type BenefitInformation = {
  serviceConnectedPercentage: number;
  awardEffectiveDateTime: string;
  monthlyAwardAmount: {
    value: number;
    currency: string;
  };
  serviceConnectedDisabilities: boolean;
  nonServiceConnectedPension: boolean;
  individualUnemployabilityGranted: boolean;
  chapter35Eligibility: boolean;
  specialMonthlyCompensation: boolean;
  adaptedHousing: boolean;
  chapter35EligibilityDateTime: string;
  hasDeathResultOfDisability: boolean;
  hasSurvivorsIndemnityCompensationAward: boolean;
  hasSurvivorsPensionAward: boolean;
};

type EligibleLettersResponse = {
  messages: Message[];
  letters: Letter[];
  letterDestination: LetterDestination;
  militaryServices: MilitaryService[];
  benefitInformation: BenefitInformation;
};

// Fetch function to get eligible letters
const fetchEligibleLetters = async (icn: string): Promise<EligibleLettersResponse> => {
  console.log('Attempting to fetch eligible letters...');

  let accessToken;

  try {
    // Retrieve access token from AsyncStorage (for mobile clients)
    accessToken = await AsyncStorage.getItem('access_token');
    console.log('Access Token Retrieved in useEligibleLetter.ts:', accessToken);
  } catch (error) {
    console.error('Error retrieving access token:', error);
  }

  if (!accessToken) {
    console.error('Access token is missing or invalid.');
    throw new Error('Access token not found');
  }

  const response = await fetch(`http://localhost:8000/api/auth/eligible-letters/?icn=${icn}`, {
    method: 'GET',
    headers: {
        Authorization: `Bearer ${accessToken}`,
        // ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Error response:', await response.text());
    throw new Error('Failed to fetch eligible letters');
  }

  const data = await response.json();
  console.log('Eligible Letters Response:', data);
  return data;
};

// Hook for fetching eligible letters
export const useEligibleLetter = (icn: string): UseQueryResult<EligibleLettersResponse> => {
  console.log('useEligibleLetter Hook Triggered');
  return useQuery<EligibleLettersResponse>({
    queryKey: ['eligibleLetters', icn], 
    queryFn: () => fetchEligibleLetters(icn), 
    enabled: !!icn, 
    staleTime: 5 * 60 * 1000, 
    retry: 1, 
  });
};
