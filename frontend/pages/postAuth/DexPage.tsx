import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useChat } from "../../utils/hooks/useChat";
import { useDisabilityRating } from "../../utils/hooks/useDisabilityRating";
import { usePatientHealth } from "../../utils/hooks/usePatientHealth";
import { ScrollView } from "react-native-gesture-handler";
import { ChatBubble } from "../../utils/interfaces/promptTypes";
import ChatRenderer from "../../components/ui/ChatRenderer";

const DexPage: React.FC = () => {
  const { useFetchPrompt, useSendSelection } = useChat();
  const [currentFile, setCurrentFile] = useState<string>("start"); 
  const [chatHistory, setChatHistory] = useState<ChatBubble[]>([]); 

  const { data: promptData, isLoading: isPromptLoading, error: isPromptError } = useFetchPrompt(currentFile);

  const { data: disabilityData, isLoading: isDisabilityLoading } = useDisabilityRating();
  const icn = disabilityData?.disability_rating?.data?.id;
  const { isLoading: isHealthLoading, isSuccess: isHealthSuccess } = usePatientHealth(icn || "");

  const mutation = useSendSelection();

  const handleOptionSelect = (nextFile: string, isAutomatic: boolean) => {
    if (isAutomatic) {
      setCurrentFile(nextFile);
    } else {
      mutation.mutate(
        { currentFile, userSelection: nextFile },
        {
          onSuccess: (data) => {
            if (data.next) {
              setCurrentFile(data.next);
            } else {
              console.warn("No `next` field in the response.");
            }
          },
        }
      );
    }
  };

  useEffect(() => {
    // Update chat history when new prompt data is fetched
    if (promptData) {
      setChatHistory((prevHistory) => [...prevHistory, promptData]);
    }
  }, [promptData]);

  if (isPromptLoading) {
    return <ActivityIndicator size="large" color="#3182F6" />;
  }

  if (isPromptError) {
    return <Text>Error: {(isPromptError as Error).message}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View>
        {promptData && (
          <ChatRenderer
            chat_bubbles={chatHistory.flatMap((chat) => chat.chat_bubbles)} // Flatten all chat bubbles from history
            options={promptData.options}
            onOptionSelect={handleOptionSelect}
            isHealthLoading={isHealthLoading}
            isHealthSuccess={isHealthSuccess}
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
