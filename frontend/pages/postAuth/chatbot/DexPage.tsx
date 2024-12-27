import React, { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator, Text, StyleSheet, ScrollView } from "react-native";
import { useChat } from "../../../utils/hooks/useChat";
import ChatRenderer from "./ChatRenderer";
import { ChatBubble } from "../../../utils/interfaces/promptTypes";
import { useDisabilityRating } from "../../../utils/hooks/useDisabilityRating";
import { usePatientHealth } from "../../../utils/hooks/usePatientHealth";
const DexPage: React.FC = () => {
  const { useFetchPrompt, useSendSelection } = useChat();
  const [currentStep, setCurrentStep] = useState<string>("start");
  const [chatHistory, setChatHistory] = useState<ChatBubble[]>([]);
  const [loadingState, setLoadingState] = useState({ showLoading: false, showSuccess: false });

  const { data: promptData, isLoading: isPromptLoading, error: isPromptError } = useFetchPrompt(currentStep);
  const mutation = useSendSelection();

  // Fetch patient health data
  const { data: disabilityData } = useDisabilityRating();
  const icn = disabilityData?.disability_rating?.data?.id;
  const { isLoading: isHealthLoading, isSuccess: isHealthSuccess } = usePatientHealth(icn || "");

  // Add prompt data to chatHistory when fetched
  useEffect(() => {
    if (promptData) {
      const isAlreadyAdded = chatHistory.some(
        (chat) => chat.chat_bubbles_id === promptData.chat_bubbles_id
      );

      if (!isAlreadyAdded) {
        console.log("Adding to chatHistory:", promptData);
        setChatHistory((prevHistory) => [...prevHistory, promptData]);
      }
    }
  }, [promptData]);

  // Transition from loading to success
  useEffect(() => {
    if (isHealthSuccess) {
      setLoadingState({ showLoading: true, showSuccess: false });

      const timeout = setTimeout(() => {
        setLoadingState({ showLoading: false, showSuccess: true });
        handleOptionSelect("upload_dd214", true); // Automatically navigate after success
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [isHealthSuccess]);

  const handleOptionSelect = (nextStep: string, isAutomatic: boolean) => {
    console.log("Option selected:", nextStep, "IsAutomatic:", isAutomatic);

    if (isAutomatic) {
      setCurrentStep(nextStep); // Navigate directly if automatic
    } else {
      mutation.mutate(
        { currentFile: currentStep, userSelection: nextStep }, // Pass current file and next step
        {
          onSuccess: (data) => {
            console.log("Mutation success:", data);
            if (data.next) {
              setCurrentStep(data.next); // Navigate to next prompt
            } else {
              console.warn("Backend response missing 'next' field.");
            }
          },
          onError: (error) => {
            console.error("Mutation error:", error);
          },
        }
      );
    }
  };

  if (isPromptLoading) {
    return <ActivityIndicator size="large" color="#3182F6" />;
  }

  if (isPromptError) {
    return <Text>Error: {(isPromptError as Error).message}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        {chatHistory.length > 0 && (
          <ChatRenderer
            chatHistory={chatHistory}
            onOptionSelect={handleOptionSelect}
            isHealthLoading={loadingState.showLoading}
            isHealthSuccess={loadingState.showSuccess}
          />
        )}
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },
});

export default DexPage;
