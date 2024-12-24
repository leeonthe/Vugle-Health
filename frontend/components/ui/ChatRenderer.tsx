import React from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";
import Logo from "../../assets/images/logo/dexLogo.svg";
import { ChatBubble } from "../../utils/interfaces/promptTypes";

//ISSUE: issue where the styles.container is not applied to the entire screen and the ScrollView content seems divided into sections
// This is bc container styling is only applied in const renderChatBubble. 

interface ChatProps extends ChatBubble {
  onOptionSelect: (next: string) => void;
}

const ChatRenderer: React.FC<ChatProps> = ({ chat_bubbles, options, onOptionSelect }) => {
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
      default:
        return null;
    }
  };

  const renderChatBubble = (
    bubble: ChatBubble["chat_bubbles"][number],
    bubbleIndex: number
  ) => (
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
        {bubbleIndex === chat_bubbles.length - 1 && options.length > 0 && (
          <View style={styles.optionsContainer}>
            {options.map((option, idx) => (
              <TouchableOpacity
                key={`option-${idx}`}
                onPress={() => option.next && onOptionSelect(option.next)}
                style={styles.optionButton}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animatable.View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {chat_bubbles.map(renderChatBubble)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    padding: 16,
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
});

export default ChatRenderer;
