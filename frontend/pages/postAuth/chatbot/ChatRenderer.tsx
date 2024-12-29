import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import * as Animatable from "react-native-animatable";
import * as DocumentPicker from "expo-document-picker";
import Logo from "../../../assets/images/logo/dexLogo.svg";
import CheckMark from "../../../assets/images/postAuth/dexPage/checkMark.svg";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ChatBubble } from "../../../utils/interfaces/promptTypes";
import { PotentialCondition } from "../../../utils/interfaces/dexTypes";

import { useDevice } from "@/utils/hooks/useDevice";
import { useChat } from "../../../utils/hooks/useChat";

import { useKeyboardStatus } from "@/utils/hooks/useKeyboardStatus";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import TypeInput from "@/components/common/TypeInput";
import PainScaleSlider from "@/components/common/PainScalesSlider";
import fetchPotentialConditions from "@/utils/hooks/fetchPotentialConditions";
// TODO:
//      + Diplay different container if isHealthLoading and isHealthSuccessful
//      + Display Keyboard when TextInput is focused

interface ChatProps {
  chatHistory: ChatBubble[];
  onOptionSelect: (nextStep: string, userResponse?: string) => void;
  isHealthLoading: boolean;
  isHealthSuccess: boolean;
}

const ChatRenderer: React.FC<ChatProps> = ({
  chatHistory,
  onOptionSelect,
  isHealthLoading,
  isHealthSuccess,
}) => {
  const [userInput, setUserInput] = React.useState<string>("");

  const [painScale, setPainScale] = useState<number>(0);
  const isKeyboardVisible = useKeyboardStatus();

  const { isDesktop } = useDevice();
  const navigation = useNavigation();

  // Hook to fetch loading.json
  const { fetchLoadingPrompt } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState<ChatBubble | null>(null);

  const triggerOptionAction = async (option: any) => {
    const { text, next } = option;
    onOptionSelect(next, text || userInput || `${painScale}`);
  };

  const handleFileUpload = async () => {
    try {
      if (isDesktop) {
        // Web/Desktop File Upload
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".pdf,.jpg,.png";
        fileInput.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            console.log("File selected:", file);

            // Create FormData to send the file
            const formData = new FormData();
            formData.append("file", file);

            triggerOptionAction({ text: file.name, next: "choose_your_claim" });

            /**
             * FOR ACTUAL USEAGE
             * 
             * try {
              // Send POST request to backend
              const response = await axios.post(
                "http://localhost:8000/api/auth/upload_dd214/",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
              console.log("File uploaded successfully:", response.data);
              triggerOptionAction({ text: file.name, next: "choose_your_claim" });

            } catch (err) {
              console.error("Error uploading file:", err);
            }
             */
          }
        };
        fileInput.click();
      } else {
        // Mobile File Upload
        const res = await DocumentPicker.getDocumentAsync({
          // type: ["application/pdf", "image/jpeg", "image/png"],
        });

        if (!res.canceled && res.assets && res.assets.length > 0) {
          const file = res.assets[0]; // Get the first file from the assets array
          const fileName = file.name;
          console.log("Selected file:", fileName);

          // Create FormData to send the file
          // const formData = new FormData();
          // formData.append("DD214", {
          //   uri: file.uri,
          //   name: fileName,
          //   type: file.mimeType,
          // });

          triggerOptionAction({ text: fileName, next: "choose_your_claim" });

          /**
           * FOR ACUTAL USAGE
           * try {
            // Send POST request to backend
            const response = await axios.post(
              "http://localhost:8000/api/auth/upload_dd214/",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            console.log("File uploaded successfully:", response.data);
            triggerOptionAction({ text: fileName, next: "choose_your_claim" });
          } catch (err) {
            console.error("Error uploading file:", err);
          }
           */
        }
      }
    } catch (err) {
      console.error("File upload error:", err);
    }
  };

  const handleConditionType = async (typedText: string) => {
    const accessToken = await AsyncStorage.getItem("access_token");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/store_user_input",
        {
          userInput: typedText,
          inputType: "conditionType",
        },
        {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          withCredentials: true, 
        }
      );

      if (response.status === 200) {
        console.log("Response from backend:", response.data);
        triggerOptionAction({ text: typedText, next: "other_condition" });
      } else {
        console.error("Unexpected response from backend:", response);
      }
    } catch (error) {
      console.error("ERROR SENDING USER TYPE TO BACKEND", error);
    }
  };

  const handlePainDuration = async (typedText: string) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/store_user_input",
        {
          userInput: typedText,
          inputType: "painDuration",
        }
      );
      if (response.status === 200) {
        console.log("Pain duration input saved:", response.data);
        triggerOptionAction({ text: typedText, next: "pain_severity" });
      } else {
        console.error("Unexpected response from backend:", response);
      }
    } catch (error) {
      console.error("Error sending pain duration input to backend:", error);
    }
  };

  // Mock data for potential conditions
  // const potentialConditions = [
  //   {
  //     name: "Condition A",
  //     risk: "High",
  //     riskColor: "red",
  //     description: "Description for Condition A",
  //   },
  //   {
  //     name: "Condition B",
  //     risk: "Medium",
  //     riskColor: "orange",
  //     description: "Description for Condition B",
  //   },
  // ];
  const handleNavigateToConditions = async () => {
    try {
      // const response = await axios.get(
      //   "http://localhost:8000/api/auth/potential_conditions_list/"
      // );
      // const potentialConditions = response.data.conditions;

      const data = await fetchPotentialConditions();
      const potentialConditions: PotentialCondition[] = data.conditions;
      console.log("Fetched potential conditions:", potentialConditions);

      navigation.navigate("PotentialConditionsPage", {
        potentialConditions,
        onReturn: (formattedConditions: string[] | string) => {
          console.log("Selected conditions:", formattedConditions);
          const conditionsArray = Array.isArray(formattedConditions)
            ? formattedConditions
            : [formattedConditions];
          triggerOptionAction({
            // Convert selected conditions to string
            text: conditionsArray.join(", "),
            next: "pain_duration",
          });
        },
      });
    } catch (error) {
      console.error("ERROR FETCHING POTENTIAL CONDITONS ", error);
    }
  };

  const renderElement = (
    element: ChatBubble["chat_bubbles"][number]["container"][number],
    index: number
  ) => {
    switch (element.type) {
      case "text":
        return (
          <Text
            key={`text-${index}`}
            style={[styles.messageText, element.style]}
          >
            {element.content}
          </Text>
        );
      case "image":
        return (
          <View key={`image-${index}`} style={styles.logoBackground}>
            <Logo style={styles.logo} />
          </View>
        );
      case "link":
        return (
          <TouchableOpacity
            key={`link-${index}`}
            onPress={() => console.log("Link clicked")}
          >
            <Text style={[styles.linkText, element.style]}>
              {element.content}
            </Text>
          </TouchableOpacity>
        );
      case "group":
        return (
          <View key={`group-${index}`} style={styles.groupContainer}>
            {element.content.map((childElement, childIndex) =>
              renderElement(childElement, childIndex)
            )}
          </View>
        );
      case "animation":
        if (element.condition === "usePatientHealth.isLoading") {
          return (
            <ActivityIndicator
              key={`animation-${index}`}
              size="large"
              color="#3182F6"
            />
          );
        }
        break;
      case "loadingImage":
        if (element.condition === "usePatientHealth.isSuccess") {
          return (
            <View key={`loadingImage-${index}`}>
              <CheckMark />
            </View>
          );
        }
        break;

      case "custom":
        return <View key={`custom-${index}`}>{element.content}</View>;

      default:
        return null;
    }
  };

  const renderOptions = (options: any[], chatIndex: number) => {
    return options.map((option, idx) => {
      const key = `${chatIndex}-option-${idx}`;

      // {/* TODO: Diplay different container if isHealthLoading and isHealthSuccessful
      //         ISSUE: it displays .json from beginning, I think its bc I am using useQuery in usePatientHealth.
      //     */}
      if (option.text === "NONE" && isHealthSuccess) {
        return isHealthLoading ? (
          <ActivityIndicator
            key={`${key}-loading`}
            size="large"
            color="#3182F6"
          />
        ) : (
          <CheckMark key={`${key}-success`} />
        );
      }

      if (option.text === "Upload DD214") {
        return (
          <TouchableOpacity
            key={`${key}-upload`}
            onPress={handleFileUpload}
            style={styles.optionButton}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        );
      }

      if (option.text === "TYPE") {
        if (option.inputType === "conditionType") {
          return (
            <TypeInput
              key={`${key}-type-condition`}
              placeholder="e.g. severe lower back pain"
              handleSubmit={handleConditionType}
            />
          );
        }

        if (option.inputType === "painDuration") {
          return (
            <TypeInput
              key={`${key}-type-pain`}
              placeholder="e.g. about 3 months"
              handleSubmit={handlePainDuration}
            />
          );
        }
      }

      if (option.text === "Let's check") {
        return (
          <TouchableOpacity
            key={`${key}-check`}
            style={styles.optionButton}
            onPress={handleNavigateToConditions}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        );
      }

      if (option.text === "SCALE_SLIDER") {
        return (
          <PainScaleSlider
            key={`${key}-slider`}
            painScale={painScale}
            setPainScale={setPainScale}
            onSubmit={() => {
              console.log("Pain Scale submitted:", painScale);
              triggerOptionAction({
                text: `${painScale}`,
                next: option.next,
              });
            }}
          />
        );
      }

      return (
        <TouchableOpacity
          key={`${key}-default`}
          onPress={() => triggerOptionAction(option)}
          style={styles.optionButton}
        >
          <Text style={styles.optionText}>{option.text}</Text>
        </TouchableOpacity>
      );
    });
  };

  const renderUserResponse = (userResponse: string, chatIndex: number) => (
    <View style={styles.chatContainer}>
      <Animatable.View
        animation="fadeIn"
        duration={1000}
        style={[styles.messageContainer, styles.userMessage]}
      >
        <View key={`user-response-${chatIndex}`}>
          <Text style={[styles.userText]}>{userResponse}</Text>
        </View>
      </Animatable.View>
    </View>
  );

  /**
   * @param bubble -> Represents a single chat bubble (💬), which contains one or more elements in its `container` array.
                    * Each element can be a piece of content such as text, an image, styles, or a custom component, 
                    * all of which collectively define how the chat bubble is displayed within the `chat_bubbles` array of a `ChatBubble`. 
                    * Check promptTypes.ts for detailed explanation. TODO: ADD EXPLANATION

   * @param bubbleIndex -> Index of the current bubble (💬) within the chat_bubbles array.
                         * Used in identifying and rendering each bubble sequentially within its parent ChatBubble. 

   * @param chatIndex -> Index of the current ChatBubble within the chatHistory array.
                       * Used in positioning and identifying which set of chat bubbles belongs to a specific step in the conversational chatbot flow.
   * @returns 
   */
  const renderChatBubble = (
    bubble: ChatBubble["chat_bubbles"][number],
    bubbleIndex: number,
    chatIndex: number
  ) => {
    const isLastBubble =
      chatIndex === chatHistory.length - 1 &&
      bubbleIndex === chatHistory[chatIndex].chat_bubbles.length - 1;

    const isLoadingBubble = chatHistory[chatIndex].chat_bubbles_id === 0;

    return (
      <View
        key={`bubble-container-${bubbleIndex}`}
        style={styles.chatContainer}
      >
        <Animatable.View
          key={`bubble-${bubbleIndex}`}
          animation={isLoadingBubble ? undefined : "fadeIn"}
          duration={isLoadingBubble ? 0 : 1000}
          delay={isLoadingBubble ? 0 : bubbleIndex * 1000}
          style={
            bubble.container.some((element) => element.type === "image")
              ? styles.logoContainer
              : styles.messageContainer
          }
        >
          {bubble.container.map((element, index) =>
            renderElement(element, index)
          )}
          {isLastBubble && chatHistory[chatIndex].options && (
            <View style={styles.optionsContainer}>
              {renderOptions(chatHistory[chatIndex].options, chatIndex)}
            </View>
          )}
        </Animatable.View>
      </View>
    );
  };

  const renderChatHistory = () => {
    return chatHistory.map((chat, chatIndex) => (
      <View key={`chat-${chatIndex}`}>
        {/* Render chatbot prompt */}
        {chat.chat_bubbles.map((bubble, bubbleIndex) =>
          renderChatBubble(bubble, bubbleIndex, chatIndex)
        )}
        {/* Render User's Response */}
        {chat.userResponse && renderUserResponse(chat.userResponse, chatIndex)}
      </View>
    ));
  };

  return <View>{renderChatHistory()}</View>;
};

const styles = StyleSheet.create({
  chatContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    marginBottom: 10,
    marginLeft: 10,
  },
  logoContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  logoBackground: {
    width: 36,
    height: 36,
    backgroundColor: "#F6F6F8",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 24,
    height: 24,
  },
  messageContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F5F6F8",
    borderRadius: 16,
    alignItems: "flex-start",
    marginBottom: 2,
    maxWidth: "90%",
    width: "auto",
  },
  messageText: {
    color: "#323D4C",
    fontSize: 16,
    fontFamily: "SF Pro",
    fontWeight: "400",
    lineHeight: 28,
    wordWrap: "break-word",
    marginBottom: 8,
  },
  linkText: {
    color: "#3182F6",
    textDecorationLine: "underline",
  },
  optionsContainer: {
    flexDirection: "column",
    alignItems: "stretch",
    marginTop: 12,
    width: "100%",
  },
  optionButton: {
    alignSelf: "stretch",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionText: {
    fontSize: 16,
    color: "#191F28",
    fontFamily: "SF Pro",
    fontWeight: "500",
    lineHeight: 28,
    textAlign: "center",
  },
  groupContainer: {
    padding: 16,
    borderRadius: 8,
  },
  dataLoadingContainer: {
    backgroundColor: "#FFFAE5",
  },
  dataSuccessContainer: {
    backgroundColor: "#E5FFFA",
  },
  typeBoxContainer: {
    marginTop: 16,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  typeBox: {
    color: "#323D4C",
    fontSize: 16,
    height: 40,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3182F6",
  },
  userText: {
    color: "#ffffff",
  },
});

export default ChatRenderer;
