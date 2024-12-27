import React, { useState } from "react";
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

import { ChatBubble } from "../../../utils/interfaces/promptTypes";
import { useDevice } from "@/utils/hooks/useDevice";
import { useKeyboardStatus } from "@/utils/hooks/useKeyboardStatus";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import TypeInput from "@/components/common/TypeInput";
import PainScaleSlider from "@/components/common/PainScalesSlider";

// TODO:
//      + Diplay different container if isHealthLoading and isHealthSuccessful
//      + Display Keyboard when TextInput is focused
// ISSUE: it displays .json from beginning
// I think its bc I am using useQuery in usePatientHealth.
// ISSUE: issue where the styles.container is not applied to the entire screen and the ScrollView content seems divided into sections
// This is bc container styling is only applied in const renderChatBubble.

interface ChatProps extends ChatBubble {
  chatHistory: {
    chat_bubbles: {
      container: {
        type: string;
        content: string;
        style?: Record<string, any>;
      }[];
    }[];
    options: { text: string; inputType?: string; next: string }[];
  }[];
  onOptionSelect: (nextStep: string, isAutomatic: boolean) => void;
  isHealthLoading: boolean;
  isHealthSuccess: boolean;
}

const ChatRenderer: React.FC<ChatProps> = ({
  chatHistory,
  onOptionSelect,
  isHealthLoading,
  isHealthSuccess,
}) => {
  const [inputValue, setInputValue] = useState("");

  const [painScale, setPainScale] = useState<number>(0);
  const isKeyboardVisible = useKeyboardStatus();

  const { isDesktop } = useDevice();
  const navigation = useNavigation();

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

            onOptionSelect("choose_your_claim", true);

            // try {
            //   // Send POST request to backend
            //   const response = await axios.post(
            //     "http://localhost:8000/api/auth/upload_dd214/",
            //     formData,
            //     {
            //       headers: {
            //         "Content-Type": "multipart/form-data",
            //       },
            //     }
            //   );
            //   console.log("File uploaded successfully:", response.data);
            //   onOptionSelect("choose_your_claim", true);
            // } catch (err) {
            //   console.error("Error uploading file:", err);
            // }
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

          onOptionSelect("choose_your_claim", true);

          // try {
          //   // Send POST request to backend
          //   const response = await axios.post(
          //     "http://localhost:8000/api/auth/upload_dd214/",
          //     formData,
          //     {
          //       headers: {
          //         "Content-Type": "multipart/form-data",
          //       },
          //     }
          //   );
          //   console.log("File uploaded successfully:", response.data);
          //   // onOptionSelect("choose_your_claim", true);
          // } catch (err) {
          //   console.error("Error uploading file:", err);
          // }
        }
      }
    } catch (err) {
      console.error("File upload error:", err);
    }
  };

  const handleConditionType = async (typedText: string) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/store_user_input",
        {
          userInput: typedText,
          inputType: "conditionType",
        }
      );

      if (response.status === 200) {
        console.log("Response from backend:", response.data);
        onOptionSelect("other_condition", false); // Trigger next step
      } else {
        console.error("Unexpected response from backend:", response);
      }
      // onOptionSelect("other_condition", false);
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
        onOptionSelect("pain_severity", false);
      } else {
        console.error("Unexpected response from backend:", response);
      }
    } catch (error) {
      console.error("Error sending pain duration input to backend:", error);
    }
  };

  const handleNavigateToConditions = () => {
    // Mock data for potential conditions
    const potentialConditions = [
      {
        name: "Condition A",
        risk: "High",
        riskColor: "red",
        description: "Description for Condition A",
      },
      {
        name: "Condition B",
        risk: "Medium",
        riskColor: "orange",
        description: "Description for Condition B",
      },
    ];

    navigation.navigate("PotentialConditionsPage", {
      potentialConditions,
      onReturn: (selectedConditions) => {
        console.log("Selected conditions:", selectedConditions);
        onOptionSelect("pain_duration", false);
      },
    });
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
          <View key={`image-${index}`} style={styles.logoContainer}>
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
      default:
        return null;
    }
  };

  const renderChatBubble = (
    bubble: ChatBubble["chat_bubbles"][number],
    bubbleIndex: number,
    chatIndex: number
  ) => {
    const isLastBubble =
      chatIndex === chatHistory.length - 1 &&
      bubbleIndex === chatHistory[chatIndex].chat_bubbles.length - 1;

    return (
      <View
        key={`bubble-container-${bubbleIndex}`}
        style={styles.chatContainer}
      >
        <Animatable.View
          key={`bubble-${bubbleIndex}`}
          animation="fadeIn"
          duration={1000}
          delay={bubbleIndex * 1000}
          style={
            bubble.container.some((element) => element.type === "image")
              ? styles.logoContainer
              : styles.messageContainer
          }
        >
          {bubble.container.map((element, index) =>
            renderElement(element, index)
          )}

          {/* Check if the current bubble has SCALE_SLIDER */}
        {/* {isLastBubble &&
          chatHistory[chatIndex].options.some(
            (option) => option.text === "SCALE_SLIDER"
          ) && (
            <PainScaleSlider
              painScale={painScale}
              setPainScale={setPainScale}
              onSubmit={() => {
                console.log("Pain Scale submitted:", painScale);
                onOptionSelect("pain_severity", false); // Replace with the next step
              }}
            />
          )} */}

          {/* TODO: Diplay different container if isHealthLoading and isHealthSuccessful
              ISSUE: it displays .json from beginning, I think its bc I am using useQuery in usePatientHealth.
          */}
          {isLastBubble && chatHistory[chatIndex].options && (
            <View style={styles.optionsContainer}>
              {chatHistory[chatIndex].options.map((option, idx) => {
                if (option.text === "NONE") {
                  if (isHealthSuccess) {
                    setTimeout(() => onOptionSelect(option.next, true), 0);
                  }
                }

                if (option.text === "TYPE") {
                  if (option.inputType === "conditionType") {
                    return (
                      <TypeInput
                        placeholder="e.g. severe lower back pain"
                        handleSubmit={handleConditionType}
                      />
                    );
                  }

                  if (option.inputType === "painDuration") {
                    return (
                      <TypeInput
                        placeholder="e.g. about 3 months"
                        handleSubmit={handlePainDuration}
                      />
                    );
                  }
                }

                if (option.text === "Let's check") {
                  return (
                    <TouchableOpacity
                      key={`option-${idx}`}
                      style={styles.optionButton}
                      onPress={handleNavigateToConditions}
                    >
                      <Text style={styles.optionText}>{option.text}</Text>
                    </TouchableOpacity>
                  );
                }

                if (option.text === "SCALE_SLIDER") {
                  // return null;
                  return (
                    <PainScaleSlider
                      painScale={painScale} // Maintain this state in ChatRenderer
                      setPainScale={setPainScale}
                      onSubmit={() => {
                        console.log("Pain Scale submitted:", painScale);
                        onOptionSelect(option.next, false);
                      }}
                    />
                  );
                }

                // Render other options as buttons
                return (
                  <TouchableOpacity
                    key={`option-${idx}`}
                    onPress={() => {
                      if (option.text === "Upload DD214") {
                        handleFileUpload();
                      } else {
                        onOptionSelect(option.next, false);
                      }
                    }}
                    style={styles.optionButton}
                  >
                    <Text style={styles.optionText}>{option.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Animatable.View>
      </View>
    );
  };

  const renderChatHistory = () => {
    return chatHistory.map((chat, chatIndex) => (
      <View key={`chat-${chatIndex}`}>
        {chat.chat_bubbles.map((bubble, bubbleIndex) =>
          renderChatBubble(bubble, bubbleIndex, chatIndex)
        )}
      </View>
    ));
  };

  return <View>{renderChatHistory()}</View>;

  // return (
  //   <View>
  //     {chatHistory.map((bubble, index) => renderChatBubble(bubble, index))}
  //   </View>
  // );
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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
    marginBottom: 8,
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
});

export default ChatRenderer;
