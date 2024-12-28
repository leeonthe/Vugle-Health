import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchUserInfo from "./fetchUserInfo"; // Ensure the correct path to the updated function

type UserInfoResponse = {
  given_name: string;
};

// Hook for fetching user's first name
export const useUserFirstName = (): UseQueryResult<UserInfoResponse> => {
  console.log("useUserFirstName Hook Triggered");
  return useQuery<UserInfoResponse>({
    queryKey: ["userFirstName"], 
    queryFn: fetchUserInfo, 
    staleTime: 5 * 60 * 1000, 
    retry: 1, 
  });
};
