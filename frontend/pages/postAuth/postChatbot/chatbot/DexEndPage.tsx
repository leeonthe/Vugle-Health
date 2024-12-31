import React, { useState, useEffect, useReducer } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import ChatRenderer from "./ChatRenderer";
import { chatHistoryReducer } from "./chatHistoryReducer";
import { useChat } from "../../../../utils/hooks/dex_api/useChat";

const initialState = {
  chatHistory: [],
  actionTriggered: false,
};

const DexEndPage: React.FC = () => {
  const { useFetchPrompt } = useChat();
  const [currentStep] = useState<string>("closing");
  const [state, dispatch] = useReducer(chatHistoryReducer, initialState);

  const { data: promptData, isLoading: isPromptLoading, error: isPromptError } =
    useFetchPrompt(currentStep);

  // Add prompt data to chatHistory
  useEffect(() => {
    if (promptData) {
      const isAlreadyAdded = state.chatHistory.some(
        (chat) => chat.chat_bubbles_id === promptData.chat_bubbles_id
      );

      if (!isAlreadyAdded) {
        dispatch({
          type: "ADD_PROMPT_DATA",
          payload: {
            ...promptData,
            source: "closing",
          },
        });
      }
    }
  }, [promptData, state.chatHistory]);

  if (isPromptLoading) {
    return <ActivityIndicator size="large" color="#3182F6" />;
  }

  if (isPromptError) {
    return <Text>Error: {(isPromptError as Error).message}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        {state.chatHistory.length > 0 && (
          <ChatRenderer
            chatHistory={state.chatHistory}
            onOptionSelect={() => {
              // No further navigation as it's the final page
              console.log("Closing page reached. No further actions.");
            }}
            isHealthLoading={false}
            isHealthSuccess={false}
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
    paddingTop: 40,
  },
});

export default DexEndPage;
