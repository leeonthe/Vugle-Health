import { useQuery, UseQueryResult } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Type definitions for the patient health API response
type Link = {
  relation: string;
  url: string;
};

type Coding = {
  system: string;
  code: string;
  display: string;
};

type ClinicalStatus = {
  coding: Coding[];
  text: string;
};

type VerificationStatus = {
  coding: Coding[];
  text: string;
};

type Category = {
  coding: Coding[];
  text: string;
};

type Code = {
  coding: Coding[];
  text: string;
};

type Subject = {
  reference: string;
  display: string;
};

type Practitioner = {
  reference: string;
  display: string;
};

type ConditionResource = {
  resourceType: string;
  id: string;
  clinicalStatus: ClinicalStatus;
  verificationStatus: VerificationStatus;
  category: Category[];
  code: Code;
  subject: Subject;
  onsetDateTime: string;
  recordedDate: string;
  recorder: Practitioner;
  asserter: Practitioner;
};

type Entry = {
  fullUrl: string;
  resource: ConditionResource;
  search: {
    mode: string;
  };
};

type PatientHealthResponse = {
  resourceType: string;
  type: string;
  total: number;
  link: Link[];
  entry: Entry[];
};

// Fetch function to get patient health data
const fetchPatientHealth = async (icn: string): Promise<PatientHealthResponse> => {
  console.log('Attempting to fetch patient health data...');

  let accessToken;

  try {
    // Retrieve access token from AsyncStorage (for mobile clients)
    accessToken = await AsyncStorage.getItem('access_token');
  } catch (error) {
    console.error('Error retrieving access token:', error);
  }

  if (!accessToken) {
    console.error('Access token is missing or invalid.');
    throw new Error('Access token not found');
  }

  const response = await fetch(`https://vugle-backend-v1.com/api/auth/patient-health/?patient=${icn}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/fhir+json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch patient health data');
  }

  const data = await response.json();
  return data;
};


// Hook for fetching patient health data
export const usePatientHealth = (icn: string): UseQueryResult<PatientHealthResponse> => {
  console.log('usePatientHealth Hook Triggered');
  return useQuery<PatientHealthResponse>({
    queryKey: ['patientHealth', icn], 
    queryFn: () => fetchPatientHealth(icn),
    enabled: !!icn,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false, // Prevent re-fetching when the window is focused
  });
};
