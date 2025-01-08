import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatBubble } from "../../interfaces/promptTypes";
import axios from 'axios';

export const useChat = () => {
  const queryClient = useQueryClient();
  const backendUrl = "https://vugle-backend-v1.com/api/dex/prompt/";

  const fetchPrompt = async (fileName: string): Promise<ChatBubble> => {
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
    try {
      const response = await axios.post(
        backendUrl,
        {
          current_file: currentFile,
          user_selection: userSelection,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, 
        }
      );
  
      return response.data; 
    } catch (error: any) {
      throw new Error(
        `Error processing selection: ${error.response?.statusText || error.message}`
      );
    }
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
