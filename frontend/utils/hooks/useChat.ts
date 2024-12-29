import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatBubble } from "../../utils/interfaces/promptTypes";

export const useChat = () => {
  const queryClient = useQueryClient();
  const backendUrl = "http://localhost:8000/api/auth/prompt/";

  const fetchPrompt = async (fileName: string): Promise<ChatBubble> => {
    console.log(`Fetching: ${backendUrl}${fileName}/`);
    const response = await fetch(`${backendUrl}${fileName}/`); // fileName includes subfolders
    if (!response.ok) {
      throw new Error(`Error fetching prompt: ${response.statusText}`);
    }
    return response.json();
  };

  const sendSelection = async (
    currentFile: string,
    userSelection: string
  ): Promise<ChatBubble> => {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_file: currentFile,
        user_selection: userSelection,
      }), // e.g., current_file: 'start/start'
    });
    if (!response.ok) {
      throw new Error(`Error processing selection: ${response.statusText}`);
    }
    return response.json();
  };

  const useFetchPrompt = (fileName: string) =>
    useQuery({
      queryKey: ["prompt", fileName],
      queryFn: () => fetchPrompt(fileName),
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });

  const useSendSelection = () =>
    useMutation({
      mutationFn: ({
        currentFile,
        userSelection,
      }: {
        currentFile: string;
        userSelection: string;
      }) => sendSelection(currentFile, userSelection),
      onSuccess: (data) => {
        queryClient.setQueryData(["prompt", data.next], data);
      },
    });

  return { useFetchPrompt, useSendSelection };
};
