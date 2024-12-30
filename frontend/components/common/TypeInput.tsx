import React, { useState } from "react";
import { SafeAreaView, TextInput, Text, StyleSheet } from "react-native";
import { useKeyboardStatus } from "../../utils/hooks/global/useKeyboardStatus";

interface TypeInputProps {
  placeholder: string;
  handleSubmit: (inputValue: string) => void;
}

const TypeInput: React.FC<TypeInputProps> = ({ placeholder, handleSubmit }) => {
  const [inputValue, setInputValue] = useState("");
  const isKeyboardVisible = useKeyboardStatus();

  const onSubmit = () => {
    if (inputValue.trim()) {
      handleSubmit(inputValue.trim());
      setInputValue(""); // Clear input after submission
    }
  };

  return (
    <SafeAreaView style={styles.typeBoxContainer}>
      <TextInput
        autoFocus
        style={[styles.typeBox, isKeyboardVisible ? styles.typeBoxFocused : null]}
        placeholder={placeholder}
        placeholderTextColor="#A0A4A8"
        value={inputValue}
        onChangeText={setInputValue}
        onSubmitEditing={onSubmit}
      />
      <Text style={styles.status}>
        {isKeyboardVisible ? "Keyboard is visible" : "Keyboard is hidden"}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  typeBoxContainer: {
    margin: 16,
  },
  typeBox: {
    borderWidth: 1,
    borderColor: "#A0A4A8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
  typeBoxFocused: {
    borderColor: "#3182F6",
  },
  status: {
    marginTop: 8,
    fontSize: 12,
    color: "#A0A4A8",
  },
});

export default TypeInput;
