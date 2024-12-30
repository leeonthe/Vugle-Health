import React, { useState, useEffect, useReducer } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as Animatable from "react-native-animatable";
import ChatRenderer from "./ChatRenderer";
import { chatHistoryReducer, ChatHistoryAction } from "./chatHistoryReducer";
// hooks
import { useChat } from "../../../utils/hooks/useChat";
import { useDisabilityRating } from "../../../utils/hooks/useDisabilityRating";
import { usePatientHealth } from "../../../utils/hooks/usePatientHealth";
import { ChatBubble } from "../../../utils/interfaces/promptTypes";

const initialState = {
  chatHistory: [],
  actionTriggered: false,
};

const DexPage: React.FC = () => {
  const { useFetchPrompt, useSendSelection } = useChat();
  const [currentStep, setCurrentStep] = useState<string>("start");
  // const [chatHistory, setChatHistory] = useState<ChatBubble[]>([]);
  const [state, dispatch] = useReducer(chatHistoryReducer, initialState);

  const [actionTriggered, setActionTriggered] = useState(false);

  const [loadingState, setLoadingState] = useState({
    showLoading: false,
    showSuccess: false,
  });

  const {
    data: promptData,
    isLoading: isPromptLoading,
    error: isPromptError,
  } = useFetchPrompt(currentStep);
  const mutation = useSendSelection();

  // Fetch patient health data
  const { data: disabilityData } = useDisabilityRating();
  const icn = disabilityData?.disability_rating?.data?.id;
  const { isLoading: isHealthLoading, isSuccess: isHealthSuccess } =
    usePatientHealth(icn || "");

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
            source: currentStep === "suitable_claim_type" ? "suitable_claim_type" : "start",
          },
        });
      }
    }
  }, [promptData, state.chatHistory]);

  /**
   *   ExpandingDot & LoadingAnimation
   *   --> To display loading message: ... with animation after user submits selection from options.
   */
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
    nextStep: string,
    userResponse?: string
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
            if (data.next) {
              setCurrentStep(data.next);
            }             
            else {
              console.log("HERE IS CALLED: ")
              // THIS IS FOR RETRIEVING GPT RESPONSE FROM BACKEND WHICH IS FORMATTED IN JSON, SINCE SUITABLE_CLAIM_TPYE.JSON DOES NOT HAVE NEXT FILED. 
              dispatch({ type: "ADD_PROMPT_DATA", payload: data });
            }
            dispatch({ type: "SET_ACTION_TRIGGERED", payload: false });

          },
          onError: (error) => {
            console.error("Error during mutation:", error);
            dispatch({ type: "SET_ACTION_TRIGGERED", payload: false });

          },
        }
      );
    }, 2000);
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
  logo: {
    width: 24,
    height: 24,
  },
  dot: {
    fontSize: 30,
    marginHorizontal: 2,
    color: "#D7D7D7",
    marginBottom: 15,
  },
});

export default DexPage;
