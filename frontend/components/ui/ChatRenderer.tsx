import React, {useState, useEffect} from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import * as Animatable from "react-native-animatable";
import * as DocumentPicker from "expo-document-picker";
import Logo from "../../assets/images/logo/dexLogo.svg";
import CheckMark from "../../assets/images/postAuth/dexPage/checkMark.svg";

import { ChatBubble } from "../../utils/interfaces/promptTypes";
import { useDevice } from "@/utils/hooks/useDevice";

//ISSUE: issue where the styles.container is not applied to the entire screen and the ScrollView content seems divided into sections
// This is bc container styling is only applied in const renderChatBubble. 

interface ChatProps extends ChatBubble {
  onOptionSelect: (next: string, isAutomatic: boolean) => void;
}

const ChatRenderer: React.FC<ChatProps & { isHealthLoading: boolean; isHealthSuccess: boolean }> = ({
  chat_bubbles,
  options,
  onOptionSelect,
  isHealthLoading,
  isHealthSuccess,
}) => {

    const { isDesktop } = useDevice();

    const [shouldTransition, setShouldTransition] = useState(false);

    useEffect(() => {
      if (isHealthSuccess) {
        // Start a timer for 3 seconds once data fetching is successful
        const timer = setTimeout(() => {
          setShouldTransition(true);
        }, 3000);
        return () => clearTimeout(timer); 
      }
    }, [isHealthSuccess]);
    
    const handleFileUpload = async () => {
        try {
        if (isDesktop) {
            // Web File Upload
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".pdf,.jpg,.png";
            fileInput.onchange = (event) => {
            const file = event.target.files[0];
            console.log("File selected:", file); 
            };
            fileInput.click();
        } else {
            // Mobile File Upload
            const res = await DocumentPicker.getDocumentAsync({
            type: [
                "application/pdf", 
                "image/jpeg", 
                "image/png", 
            ],
            });
            if (res.type === "success") {
            console.log("File selected:", res); 
            }
        }
        } catch (err) {
        console.error("File upload error:", err);
        }
    };

  const renderElement = (
    element: ChatBubble["chat_bubbles"][number]["container"][number],
    index: number
  ) => {
    switch (element.type) {
      case "text":
        return (
          <Text key={`text-${index}`} style={[styles.messageText, element.style]}>
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
            <Text style={[styles.linkText, element.style]}>{element.content}</Text>
          </TouchableOpacity>
        );
        case "group":
          return (
            <View key={`group-${index}`} style={styles.groupContainer}>
              {element.content.map((childElement, childIndex) => renderElement(childElement, childIndex))}
            </View>
          );
        case "animation":
          if (element.condition === "usePatientHealth.isLoading") {
            return <ActivityIndicator key={`animation-${index}`} size="large" color="#3182F6" />;
          }
          break;
        case "loadingImage":
          if (element.condition === "usePatientHealth.isSuccess") {
            return <View key={`loadingImage-${index}`}>
                      <CheckMark/>
                    </View>
                    };
          break;
      default:
        return null;
    }
  };

  const renderChatBubble = (bubble: ChatBubble["chat_bubbles"][number], bubbleIndex: number) => {
    console.log("Rendering Chat Bubble:", bubble);
  console.log("Bubble Index:", bubbleIndex);
    const isLastBubble = bubbleIndex === chat_bubbles.length - 1;
  
    return (
      <View style={styles.chatContainer}>
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
          {bubble.container.map((element, index) => renderElement(element, index))}
  
          {/* Render options explicitly inside the last chat bubble */}
          {isLastBubble && (
            <View style={styles.optionsContainer}>
              {options.map((option, idx) => {
                if (option.text === "NONE") {
                  // Automatically transition to the next JSON when data fetching is complete.
                  if (isHealthSuccess) {
                    // Display check mark while waiting for the 3-second delay
                    if (!shouldTransition) {
                      return (
                        <View key={`checkmark-${idx}`} style={styles.successIndicatorContainer}>
                          <CheckMark />
                        </View>
                      );
                    }

                    // After 3 seconds, transition to the next JSON
                    if (shouldTransition) {
                      setTimeout(() => onOptionSelect(option.next, true), 0);
                    }
                  }

                  return null; // No need to display anything for "NONE".
                }
  
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
  


  return (
    <View>

      {chat_bubbles.map(renderChatBubble)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    overflow: "scroll", 
  },
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
});

export default ChatRenderer;