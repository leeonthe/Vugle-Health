import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatBubble } from "../../utils/interfaces/promptTypes";
import * as Animatable from "react-native-animatable";
import Logo from "../../../assets/images/logo/dexLogo.svg";

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

    
  const fetchLoadingPrompt = async (): Promise<ChatBubble> => {
    const loadingFileName = "loading";
    console.log(`Fetching loading prompt: ${backendUrl}${loadingFileName}/`);
    const response = await fetch(`${backendUrl}${loadingFileName}/`);
    if (!response.ok) {
      throw new Error(`Error fetching loading prompt: ${response.statusText}`);
    }
    return response.json();
  };

  return { useFetchPrompt, useSendSelection, fetchLoadingPrompt };
};
