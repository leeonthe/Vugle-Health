import React, { useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useChat } from "../../utils/hooks/useChat";
import ChatRenderer from "../../components/ui/ChatRenderer";

const DexPage: React.FC = () => {
  const { useFetchPrompt, useSendSelection } = useChat();
  const [currentFile, setCurrentFile] = useState<string>("start"); // Explicitly typed as string

  // Fetch current prompt
  const { data, isLoading, error } = useFetchPrompt(currentFile);

  // Handle user selection
  const mutation = useSendSelection();

  const handleOptionSelect = (nextFile: string) => {
    mutation.mutate(
      { currentFile, userSelection: nextFile },
      {
        onSuccess: (data) => {
          if (data.next) {
            setCurrentFile(data.next); // Ensure `data.next` is defined
          } else {
            console.warn("No `next` field in the response.");
          }
        },
      }
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#3182F6" />;
  }

  if (error) {
    return <Text>Error: {(error as Error).message}</Text>;
  }

  return (
    <View>
      {data && (
        <ChatRenderer
          chat_bubbles={data.chat_bubbles}
          options={data.options}
          onOptionSelect={handleOptionSelect}
        />
      )}
    </View>
  );
};

export default DexPage;
