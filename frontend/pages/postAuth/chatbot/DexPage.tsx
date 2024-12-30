import React, { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as Animatable from "react-native-animatable";
import ChatRenderer from "./ChatRenderer";

// hooks
import { useChat } from "../../../utils/hooks/useChat";
import { useDisabilityRating } from "../../../utils/hooks/useDisabilityRating";
import { usePatientHealth } from "../../../utils/hooks/usePatientHealth";
import { ChatBubble } from "../../../utils/interfaces/promptTypes";

const DexPage: React.FC = () => {
  const { useFetchPrompt, useSendSelection } = useChat();
  const [currentStep, setCurrentStep] = useState<string>("start");
  const [chatHistory, setChatHistory] = useState<ChatBubble[]>([]);
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
  // 1011537977V693883 -> ICN provided in the va.gov API docs
  // Add prompt data to chatHistory
  useEffect(() => {
    if (promptData) {
      const isAlreadyAdded = chatHistory.some(
        (chat) => chat.chat_bubbles_id === promptData.chat_bubbles_id
      );

      if (!isAlreadyAdded) {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          {
            ...promptData,
            source: currentStep === "suitable_claim_type" ? "suitable_claim_type" : "start", // Dynamically set the source
          },
        ]);
      }
    }
  }, [promptData]);

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
    if (actionTriggered) {
      console.log("Action already triggered. Skipping...");
      return; 
    }
    setActionTriggered(true);

    console.log("Option selected:", nextStep, "User Response:", userResponse);

    // Append user response to chatHistory
    if (userResponse) {
      setChatHistory((prevHistory) => [
        ...prevHistory,
        {
          chat_bubbles_id: -1,
          chat_bubbles: [],
          options_id: -1,
          options: [],
          userResponse,
        },
      ]);
    }

    /**
     * Adding a temporary loading message with a logo and animation to the chatHistory.
     * Specified loadingId = 0, to display both logo & loading message simultaneously
     */
    const loadingId = 0;
    setChatHistory((prevHistory) => [
      ...prevHistory,
      {
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
      },
    ]);

    setTimeout(() => {
      // Removing loading message
      setChatHistory((prevHistory) =>
        prevHistory.filter((chat) => chat.chat_bubbles_id !== loadingId)
      );

      // Navigate to next step
      mutation.mutate(
        { currentFile: currentStep, userSelection: nextStep },
        {
          onSuccess: (data) => {
            if (data.next) {
              setCurrentStep(data.next);
            } else if (data.source === "suitable_claim_type"){
              setChatHistory((prevHistory) => [...prevHistory, data]);
            } else{
              setChatHistory((prevHistory) => [...prevHistory, data]);
            }
            setActionTriggered(false);
          },
          onError: (error) => {
            console.error("Error during mutation:", error);
            setActionTriggered(false);
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
        {chatHistory.length > 0 && (
          <ChatRenderer
            chatHistory={chatHistory}
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
    borderRadius: 24,
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
