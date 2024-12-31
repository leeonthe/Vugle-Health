import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import * as DocumentPicker from "expo-document-picker";
import Logo from "../../../../assets/images/logo/dexLogo.svg";
import CheckMark from "../../../../assets/images/postAuth/dexPage/checkMark.svg";
import { useNavigation } from "@react-navigation/native";

import { ChatBubble } from "../../../../utils/interfaces/promptTypes";
import { PotentialCondition } from "../../../../utils/interfaces/dexTypes";

// hooks
import { useDevice } from "../../../../utils/hooks/global/useDevice";
import { useAuthenticatedRequest } from "../../../../utils/hooks/dex_api/useAuthenticatedRequest";
import { useKeyboardStatus } from "../../../../utils/hooks/global/useKeyboardStatus";

import TypeInput from "@/components/common/TypeInput";
import PainScaleSlider from "@/components/common/PainScalesSlider";
import AsyncStorage from "@react-native-async-storage/async-storage";

import fetchPotentialConditions from "../../../../utils/api_handler/fetchPotentialConditions";

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
  isHealthLoading: initialIsHealthLoading,
  isHealthSuccess: initialIsHealthSuccess,
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>(
    {}
  );
  const [triggeredGroups, setTriggeredGroups] = useState<Set<number>>(
    new Set()
  );

  const handleLoadingState = (groupIndex: number) => {
    if (!(groupIndex in loadingStates)) {
      // Delay the entire process by 3 seconds
      setTimeout(() => {
        setLoadingStates((prev) => ({
          ...prev,
          [groupIndex]: true,
        }));

        // Stop loading after another 3 seconds
        setTimeout(() => {
          setLoadingStates((prev) => ({
            ...prev,
            [groupIndex]: false, // Set loading to false
          }));
        }, 3000);
      }, 3000);
    }

    return loadingStates[groupIndex] ?? true;
  };

  const [userInput, setUserInput] = React.useState<string>("");

  const [painScale, setPainScale] = useState<number>(1);
  const isKeyboardVisible = useKeyboardStatus();

  const { isDesktop } = useDevice();
  const navigation = useNavigation();

  const [isHealthLoading, setIsHealthLoading] = useState(
    initialIsHealthLoading
  );
  const [isHealthSuccess, setIsHealthSuccess] = useState(
    initialIsHealthSuccess
  );

  const { makeRequest } = useAuthenticatedRequest();

  const triggerOptionAction = async (option: any) => {
    const { text, next } = option;
    onOptionSelect(next, text || userInput || `${painScale}`);
  };

  const triggerOptionSingleAction = async (nextStep: string) => {
    onOptionSelect(nextStep);
  };

  const handleFileUpload = async () => {
    const accessToken = await AsyncStorage.getItem("access_token");
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
             */
            // try {
            //   // Send POST request to backend
            //   const response = await axios.post(
            //                 "http://localhost:8000/api/dex/upload_dd214/",
            //                 formData,
            //                 {
            //                     headers: {
            //                         "Content-Type": "multipart/form-data",
            //                         ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            //                     },
            //                 }
            //             );

            //   console.log("File uploaded successfully:", response.data);
            //   triggerOptionAction({ text: file.name, next: "choose_your_claim" });

            // } catch (err) {
            //   console.error("Error uploading file:", err);
            // }
          }
        };
        fileInput.click();
      } else {
        // Mobile File Upload
        const res = await DocumentPicker.getDocumentAsync({
          type: ["application/pdf", "image/jpeg", "image/png"],
        });

        if (!res.canceled && res.assets && res.assets.length > 0) {
          const file = res.assets[0]; // Get the first file from the assets array
          const fileName = file.name;
          console.log("Selected file:", fileName);

          // Create FormData to send the file
          const formData = new FormData();
          formData.append("file", {
            uri: file.uri,
            name: fileName,
            type: file.mimeType || "application/pdf",
          });
          triggerOptionAction({ text: file.name, next: "choose_your_claim" });

          /**
           * FOR ACUTAL USAGE
           *
           */
          //  try {
          //   // Send POST request to backend
          //   const response = await axios.post(
          //     "http://localhost:8000/api/dex/upload_dd214/",
          //     formData,
          //     {
          //         headers: {
          //             "Content-Type": "multipart/form-data",
          //             ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          //         },
          //     }
          // );
          //   console.log("[MOBILE] File uploaded successfully to backend");
          //   triggerOptionAction({ text: fileName, next: "choose_your_claim" });
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
      await makeRequest("http://localhost:8000/api/dex/store_user_input", {
        userInput: typedText,
        inputType: "conditionType",
      });
      console.log("Condition type input successfully sent to the backend.");
      triggerOptionAction({ text: typedText, next: "other_condition" });
    } catch (error) {
      console.error("ERROR SENDING USER TYPE TO BACKEND", error);
    }
  };

  const handlePainDuration = async (typedText: string) => {
    try {
      await makeRequest("http://localhost:8000/api/dex/store_user_input", {
        userInput: typedText,
        inputType: "painDuration",
      });
      console.log("Pain duration input successfully sent to the backend.");
      triggerOptionAction({ text: typedText, next: "pain_severity" });
    } catch (error) {
      console.error("Error sending pain duration input to backend:", error);
    }
  };

  /**
   * Below handleNavigateToConditions is actual method.
   */
  const handleNavigateToConditions = async () => {
    try {
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

  /**
   * Below handleNavigateToConditions is for testing purpose.
   * -> it does not call gpt api.
   */
  // const handleNavigateToConditions = async () => {
  //   try {
  //     // Mock data for potential conditions
  //     const potentialConditions = [
  //       {
  //         name: "Condition A",
  //         risk: "High",
  //         riskColor: "red",
  //         description:
  //           "DTo display the + icon on the right side, you can adjust the layout of the button to use flexDirection: This way, the Icon will be positioned after the Text.",
  //       },
  //       {
  //         name: "Condition B",
  //         risk: "Medium",
  //         riskColor: "orange",
  //         description: "Description for Condition B",
  //       },
  //       {
  //         name: "Condition A",
  //         risk: "High",
  //         riskColor: "red",
  //         description: "Description for Condition A",
  //       },
  //       {
  //         name: "Condition B",
  //         risk: "Medium",
  //         riskColor: "orange",
  //         description: "Description for Condition B",
  //       },
  //       // {
  //       //   name: "Condition A",
  //       //   risk: "High",
  //       //   riskColor: "red",
  //       //   description: "Description for Condition A",
  //       // },
  //       // {
  //       //   name: "Condition B",
  //       //   risk: "Medium",
  //       //   riskColor: "orange",
  //       //   description: "Description for Condition B",
  //       // },
  //       // {
  //       //   name: "Condition A",
  //       //   risk: "High",
  //       //   riskColor: "red",
  //       //   description: "Description for Condition A",
  //       // },
  //       // {
  //       //   name: "Condition B",
  //       //   risk: "Medium",
  //       //   riskColor: "orange",
  //       //   description: "Description for Condition B",
  //       // },
  //     ];

  //     navigation.navigate("PotentialConditionsPage", {
  //       potentialConditions,
  //       onReturn: (formattedConditions: string[] | string) => {
  //         console.log("Selected conditions:", formattedConditions);
  //         const conditionsArray = Array.isArray(formattedConditions)
  //           ? formattedConditions
  //           : [formattedConditions];
  //         triggerOptionAction({
  //           // Convert selected conditions to string
  //           text: conditionsArray.join(", "),
  //           next: "pain_duration",
  //         });
  //       },
  //     });
  //   } catch (error) {
  //     console.error("ERROR FETCHING POTENTIAL CONDITONS ", error);
  //   }
  // };


  const handleNavigateToHospital = () => {
    console.log("Navigating to HospitalPageScreen");
      navigation.navigate('HospitalPageScreen');
  };


  const handleGroupLogic = (groupIndex: number) => {
    const currentSource =
      chatHistory[chatHistory.length - 1]?.source || "unknown";
    const isStartBubble = chatHistory.some(
      (chat) => chat.chat_bubbles_id === 1
    );
    const isLoading = handleLoadingState(groupIndex);
    if (
      !isLoading &&
      !triggeredGroups.has(groupIndex) &&
      currentSource === "start" &&
      isStartBubble
    ) {
      setTriggeredGroups((prev) => new Set([...prev, groupIndex]));
      onOptionSelect("upload_dd214");
    }
  };

  const renderElement = (
    element: ChatBubble["chat_bubbles"][number]["container"][number],
    index: number,
    groupIndex: number | null = null
  ) => {
    const isLoading = handleLoadingState(groupIndex ?? index);

    switch (element.type) {
      /**
       * Need to update to support suitable_claim_type.json
       */
      case "group":
        handleGroupLogic(index);

        return (
          <View key={`group-${index}`} style={styles.groupContainer}>
            {element.content.map((childElement: any, childIndex: number) => {
              if (childElement.type === "text") {
                return (
                  <View
                    key={`group-row-${childIndex}`}
                    style={styles.rowContainer}
                  >
                    {/* Render the text on the left */}
                    <View style={styles.loadingMessageContainer}>
                      <Text
                        style={[
                          styles.loadingMessageText,
                          childElement.style,
                          { opacity: isLoading ? 1 : 0 },
                        ]}
                      >
                        {childElement.content}
                      </Text>
                      <Text
                        style={[
                          styles.loadingMessageText,
                          childElement.style,
                          { opacity: isLoading ? 0 : 1 },
                        ]}
                      >
                        {childElement.updated}
                      </Text>
                    </View>

                    {/* Render the ActivityIndicator or CheckMark */}
                    <View style={styles.rightAlignedContainer}>
                      {isLoading ? (
                        <ActivityIndicator
                          key={`loading-${childIndex}`}
                          size="small"
                          color="#3182F6"
                          style={styles.loadingIndicator}
                        />
                      ) : (
                        <CheckMark
                          key={`checkmark-${childIndex}`}
                          style={styles.checkMarkPosition}
                        />
                      )}
                    </View>
                  </View>
                );
              }

              if (
                childElement.type === "animation" ||
                childElement.type === "loadingImage"
              ) {
                return null;
              }

              // Default rendering for other elements
              return renderElement(childElement, childIndex, index);
            })}
          </View>
        );

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

      case "custom":
        return <View key={`custom-${index}`}>{element.content}</View>;

      default:
        return null;
    }
  };

  const renderOptions = (options: any[], chatIndex: number) => {
    return options.map((option, idx) => {
      const key = `${chatIndex}-option-${idx}`;

      if (option.text === "NONE") {
        return null;
      }

      // TEST CASE
      if (option.tex === "I do not have it") {
        onOptionSelect("suitable_claim_type");
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

      // Handle this case: display no option field, but wait til data is fetched from backend.
      if (option.text === "TEST") {
        // triggerOptionAction
      }

      if (option.text === "View medical centers") {
        return (
        <TouchableOpacity
            key={`${key}-hospital`}
            style={styles.optionButton}
            onPress={handleNavigateToHospital}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>

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
    <View style={styles.userResponseContainer}>
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
    paddingBottom: 10,
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
  
  loadingMessageText: {
    color: "#323D4C",
    fontSize: 16,
    fontFamily: "SF Pro",
    fontWeight: "400",
    lineHeight: 28,
  },
  groupContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F5F6F8",
    borderRadius: 16,
    alignItems: "flex-start",
    maxWidth: "90%",
    width: "auto",

  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 8,
    width: "100%",
  },
  loadingMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
  },

  rightAlignedContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 25, 
  },
  loadingIndicator: {
    alignSelf: "center",
  
  },
  checkMarkPosition: {
    alignSelf: "center",
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
  userResponseContainer: {
    paddingBottom: 12,
    paddingTop: 12,
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
