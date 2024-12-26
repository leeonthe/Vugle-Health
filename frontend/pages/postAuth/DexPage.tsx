import React, { useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useChat } from "../../utils/hooks/useChat";
import ChatRenderer from "../../components/ui/ChatRenderer";
import { useDisabilityRating } from '../../utils/hooks/useDisabilityRating';
import { usePatientHealth } from '../../utils/hooks/usePatientHealth';

const DexPage: React.FC = () => {
  const { useFetchPrompt, useSendSelection } = useChat();
  const [currentFile, setCurrentFile] = useState<string>("start"); // Explicitly typed as string

  // Fetch current prompt
  const { data: promptData, isLoading: isPromptLoading, error: isPromptError } = useFetchPrompt(currentFile);
  
  const { data: disabilityData, isLoading: isDisabilityLoading, isError: isDisabilityError } = useDisabilityRating();
  const icn = disabilityData?.disability_rating?.data?.id;
  const { isLoading: isHealthLoading, isSuccess: isHealthSuccess } = usePatientHealth(icn || ''); // Example ICN.


  // Handle user selection
  const mutation = useSendSelection();

  const handleOptionSelect = (nextFile: string, isAutomatic?: boolean) => {
    if (isAutomatic) {
      // Automatic transition (e.g., "NONE"): Fetch the next file directly
      setCurrentFile(nextFile);
    } else{


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
    }
  };

  if (isPromptLoading) {
    return <ActivityIndicator size="large" color="#3182F6" />;
  }

  if (isPromptError) {
    return <Text>Error: {(isPromptError as Error).message}</Text>;
  }

  return (
    <View>
      {promptData && (
        <ChatRenderer
          chat_bubbles={promptData.chat_bubbles}
          options={promptData.options}
          onOptionSelect={handleOptionSelect}
          isHealthLoading={isHealthLoading}
          isHealthSuccess={isHealthSuccess}
        />
      )}
    </View>
  );
};

export default DexPage;