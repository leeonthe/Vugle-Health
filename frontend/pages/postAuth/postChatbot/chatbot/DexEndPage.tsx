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
import * as Animatable from "react-native-animatable";

const initialState = {
  chatHistory: [],
  actionTriggered: false,
};

const DexEndPage: React.FC = () => {

  const { useFetchPrompt, useSendSelection } = useChat();
  const [currentStep] = useState<string>("closing");
  const [state, dispatch] = useReducer(chatHistoryReducer, initialState);
  const mutation = useSendSelection();

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

  const ExpandingDot = ({ delay }: { delay: number }) => (
    <Animatable.Text
      animation={{
        0: { transform: [{ scale: 1 }] },
        0.5: { transform: [{ scale: 1.5 }] },
        1: { transform: [{ scale: 1 }] },
      }}
      iterationCount="infinite"
      direction="alternate"
      delay={delay}
      style={styles.dot}
    >
      .
    </Animatable.Text>
  );

  const LoadingAnimation = () => (
    <View style={styles.loadingContainer}>
      <ExpandingDot delay={0} />
      <ExpandingDot delay={200} />
      <ExpandingDot delay={400} />
    </View>
  );

  
  const handleOptionSelect = async (
    nextStep: string | null,
    userResponse?: string,
    gptResponse?: any
  ) => {
    // Prevent duplicate calls
    if (state.actionTriggered) {
      console.log("Action already triggered. Skipping...");
      return;
    }
    dispatch({ type: "SET_ACTION_TRIGGERED", payload: true });

    console.log("Option selected:", nextStep, "User Response:", userResponse);

    if (userResponse) {
      dispatch({
        type: "ADD_USER_RESPONSE",
        payload: {
          chat_bubbles_id: -1,
          chat_bubbles: [],
          options_id: -1,
          options: [],
          userResponse,
        },
      });
    }

    if (gptResponse) {
      console.log("Adding GPT response to chat history...");
      dispatch({
        type: "ADD_PROMPT_DATA",
        payload: {
          ...gptResponse,
          source: "suitable_claim_type",
        },
      });
      dispatch({ type: "SET_ACTION_TRIGGERED", payload: false });
      return;
    }

    if (!nextStep) {
      console.error("No next step or GPT response provided.");
      dispatch({ type: "SET_ACTION_TRIGGERED", payload: false });
      return;
    }

    /**
     * Adding a temporary loading message with a logo and animation to the chatHistory.
     * Specified loadingId = 0, to display both logo & loading message simultaneously
     */
    const loadingMessage = {
      chat_bubbles_id: 0,
      options_id: 0,
      chat_bubbles: [
        {
          container: [
            {
              type: "image",
              content: "app_logo",
              style: {
                width: 24,
                height: 24,
              },
            },
          ],
        },
        {
          container: [
            {
              type: "custom",
              content: <LoadingAnimation />,
            },
          ],
        },
      ],
      options: [],
    };

    dispatch({ type: "ADD_LOADING_MESSAGE", payload: loadingMessage });

    setTimeout(() => {
      dispatch({ type: "REMOVE_LOADING_MESSAGE", payload: 0 });

      mutation.mutate(
        { currentFile: currentStep, userSelection: nextStep },
        {
          onSuccess: (data) => {
              dispatch({ type: "ADD_PROMPT_DATA", payload: data });
          },
          onError: (error) => {
            console.error("Error during mutation:", error);
            dispatch({ type: "SET_ACTION_TRIGGERED", payload: false });
          },
        }
      );
    }, 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        {state.chatHistory.length > 0 && (
          <ChatRenderer
            chatHistory={state.chatHistory}
            onOptionSelect={handleOptionSelect}
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
  dot: {
    fontSize: 30,
    marginHorizontal: 2,
    color: "#D7D7D7",
    marginBottom: 15,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    marginTop: -10,
    marginBottom: -10,
    borderRadius: 16,
    width: "auto",
  },
});

export default DexEndPage;
