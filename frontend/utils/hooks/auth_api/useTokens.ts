import { useState } from "react";

interface Tokens {
  accessToken: string | null;
  idToken: string | null;
  error: string | null;
  loading: boolean;
  fetchTokens: () => Promise<void>;
}

const useTokens = (): Tokens => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTokens = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://vugle-backend-v1.com/api/get_tokens/", {
        method: "GET",
        credentials: "include", // Ensures cookies/session are included in the request
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tokens. Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.access_token && data.id_token) {
        setAccessToken(data.access_token);
        setIdToken(data.id_token);
      } else {
        throw new Error("Tokens not found in the response.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return { accessToken, idToken, error, loading, fetchTokens };
};

export default useTokens;
