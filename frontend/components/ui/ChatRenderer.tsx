import React from "react";
import { Text, View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { ChatBubble } from "../../utils/interfaces/promptTypes"; // Import the type definition

interface ChatProps extends ChatBubble {
  onOptionSelect: (next: string) => void;
}

const ChatRenderer: React.FC<ChatProps> = ({ chat_bubbles, options, onOptionSelect }) => {
  const renderElement = (element: ChatBubble["chat_bubbles"][number]["container"][number], index: number) => {
    switch (element.type) {
      case "text":
        return (
          <Text key={index} style={[styles.defaultTextStyle, element.style]}>
            {element.content}
          </Text>
        );
      case "image":
        return (
          <Image
            key={index}
            source={{ uri: element.content }}
            style={[styles.defaultImageStyle, element.style]}
          />
        );
      case "link":
        return (
          <TouchableOpacity key={index} onPress={() => console.log("Link clicked")}>
            <Text style={[styles.defaultLinkStyle, element.style]}>{element.content}</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderChatBubble = (bubble: ChatBubble["chat_bubbles"][number], index: number) => (
    <View key={index} style={styles.chatBubble}>
      {bubble.container.map(renderElement)}
    </View>
  );

  return (
    <View>
      {/* Render chat bubbles */}
      {chat_bubbles.map(renderChatBubble)}

      {/* Render response options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => option.next && onOptionSelect(option.next)} // Ensure `next` is defined
            style={styles.optionButton}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chatBubble: {
    backgroundColor: "#F8F9FA", // Light gray background
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    backgroundColor: "#3182F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  optionText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  defaultTextStyle: {
    color: "#323D4C",
    fontSize: 16,
    fontFamily: "SF Pro",
    fontWeight: "400",
    lineHeight: 28,
    wordWrap: "break-word",
  },
  defaultLinkStyle: {
    color: "#3182F6",
    textDecorationLine: "underline",
  },
  defaultImageStyle: {
    width: 24,
    height: 24,
  },
});

export default ChatRenderer;
