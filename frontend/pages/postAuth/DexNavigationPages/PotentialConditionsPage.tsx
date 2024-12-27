import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

const PotentialConditionsPage = ({ route }) => {
  const { potentialConditions, onReturn, onContinueToChatbot } = route.params;
  const navigation = useNavigation();
  const [selectedConditions, setSelectedConditions] = useState({});

  const toggleCondition = (conditionName) => {
    setSelectedConditions((prev) => ({
      ...prev,
      [conditionName]: !prev[conditionName],
    }));
  };

  const handleContinue = async () => {
    const addedConditions = Object.keys(selectedConditions).filter(
      (key) => selectedConditions[key]
    );

    if (addedConditions.length > 0) {
      try {
        await axios.post("http://localhost:8000/api/auth/potential_conditions/", {
          conditions: addedConditions,
        });
        console.log("Conditions sent to backend:", addedConditions);
      } catch (error) {
        console.error("Error sending conditions:", error);
      }
    }

    if (onReturn) {
      onReturn(addedConditions);
    }

    // onContinueToChatbot("pain_duration");
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Potential Affected Conditions</Text>
        <Text style={styles.subtitle}>
          Please check the following symptoms and select if you are having any.
        </Text>
      </View>

      {potentialConditions.map((condition, index) => (
        <View key={index} style={styles.conditionContainer}>
          <View style={styles.conditionHeader}>
            <View style={styles.iconPlaceholder} />
            <View style={styles.conditionDetails}>
              <Text style={styles.conditionName}>{condition.name}</Text>
              <Text style={[styles.riskText, { color: condition.riskColor }]}>
                {condition.risk}
              </Text>
              <Text style={styles.description}>{condition.description}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.addButton,
              selectedConditions[condition.name] && styles.addedButton,
            ]}
            onPress={() => toggleCondition(condition.name)}
          >
            {selectedConditions[condition.name] ? (
              <>
                <Icon name="check" size={16} color="white" />
                <Text style={styles.addButtonText}>Added</Text>
              </>
            ) : (
              <>
                <Icon name="add" size={16} color="white" />
                <Text style={styles.addButtonText}>Add +</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  header: {
    marginTop: 60,
    backgroundColor: "#F7F9FD",
    padding: 20,
    marginBottom: 35,
    borderRadius: 8,
  },
  title: {
    color: "#191F28",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    color: "#6B7685",
    fontSize: 14,
    lineHeight: 21,
  },
  conditionContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  conditionHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: "#AFB0CC",
    borderRadius: 24,
    marginRight: 16,
  },
  conditionDetails: {
    flex: 1,
  },
  conditionName: {
    color: "black",
    fontSize: 16,
    fontWeight: "500",
  },
  riskText: {
    fontSize: 12,
    fontWeight: "500",
  },
  description: {
    color: "#323D4C",
    fontSize: 13,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: "#237AF2",
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  addedButton: {
    backgroundColor: "#0066CC",
  },
  addButtonText: {
    color: "white",
    fontSize: 12,
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: "#237AF2",
    borderRadius: 8,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default PotentialConditionsPage;
