import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Back from '../../../../../assets/images/logo/back.svg'; 

const AppointmentMessagePage: React.FC = () => {
  const navigation = useNavigation();
  const [appointmentMessage, setAppointmentMessage] = useState<string>("");
  const route = useRoute();
  const { hospitalName } = route.params as { hospitalName: string };

  useEffect(() => {
    const loadAppointmentMessage = async () => {
      try {
        const message = await AsyncStorage.getItem("appointmentMessage");
        setAppointmentMessage(message || "");
      } catch (error) {
        console.error("Error loading appointment message:", error);
      }
    };

    loadAppointmentMessage();
  }, []);

  const navigateToHomePage = () => {
    navigation.goBack();
  };

  const handleNavigation = () => {
    navigation.navigate("AppointmentSummaryPage", {hospitalName});
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.back}>
        <TouchableOpacity onPress={navigateToHomePage}>
          <Back width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}></View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Appointment date</Text>
      </View>

      {appointmentMessage && (
        <View style={styles.labelContainer}>
            <Text style={styles.labelText}>
            Message <Text style={styles.optionalText}>(optional)</Text>
          </Text>
        </View>
      )}

      {/* Appointment Message Section */}
      {appointmentMessage ? (
        <View style={styles.messageContainer}>
          <Text style={styles.autofilledText}>(autofilled by Dex)</Text>
          <Text style={styles.messageText}>{appointmentMessage}</Text>
        </View>
      ) : null}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNavigation}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  } as ViewStyle,
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    marginTop: -18,
  } as ViewStyle,
  back: {
    marginTop: 80,
    marginLeft: 10,
  } as ViewStyle,
  titleContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 45,
    marginTop: -20,
    marginLeft: 10,
  } as ViewStyle,
  title: {
    color: "#222222",
    fontSize: 24,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
    lineHeight: 38,
  } as TextStyle,
  labelContainer: {
    marginBottom: 18,
    marginHorizontal: 10,
  } as ViewStyle,
  labelText: {
    fontSize: 14,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: "#000000",
  } as TextStyle,
  optionalText: {
    color: "#7D7D7D",
  } as TextStyle,
  messageContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1, 
    borderColor: "#D1D5DB",
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 10,
  } as ViewStyle,
  autofilledText: {
    fontSize: 14,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: "#7D7D7D",
    marginBottom: 8,
  } as TextStyle,
  messageText: {
    fontSize: 16,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: "#7D7D7D",
    lineHeight: 24,
  } as TextStyle,
  buttonContainer: {
    marginTop: 290,
    alignItems: "center",
  } as ViewStyle,
  button: {
    width: 357,
    height: 52,
    backgroundColor: "#237AF2",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "SF Pro Display",
    fontWeight: "500",
    lineHeight: 16,
  } as TextStyle,
});

export default AppointmentMessagePage;
