import React, { useState } from "react";
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
import Back from "../../../../../assets/images/logo/back.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppointmentTimePage: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const route = useRoute();
  const { hospitalName } = route.params as { hospitalName: string };

  const navigateToHomePage = () => {
    navigation.goBack();
  };

  const handleNavigation = async () => {
    try {
      if (selectedTime) {
        await AsyncStorage.setItem("selectedTime", selectedTime);
      }
      navigation.navigate("AppointmentMessagePage", { hospitalName });
    } catch (error) {
      console.error("Error saving selected time:", error);
    }
  };
  
  const timeSlots = {
    morning: ["9:00", "9:30", "10:00", "10:30"],
    afternoon: ["12:30", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00"],
  };

  const handleTimeSelection = (time: string, period: "AM" | "PM") => {
    setSelectedTime(`${time} ${period}`);
  };

  const renderTimeSlot = (time: string, period: "AM" | "PM") => (
    <TouchableOpacity
      key={time}
      style={[
        styles.timeSlot,
        selectedTime === `${time} ${period}` && styles.selectedTimeSlot,
      ]}
      onPress={() => handleTimeSelection(time, period)}
    >
      <Text
        style={[
          styles.timeText,
          selectedTime === `${time} ${period}` && styles.selectedTimeText,
        ]}
      >
        {time}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.back}>
        <TouchableOpacity onPress={navigateToHomePage}>
          <Back width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}></View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Appointment Time</Text>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.sectionTitle}>Morning</Text>
        <View style={styles.timeRow}>
          {timeSlots.morning.map((time) => renderTimeSlot(time, "AM"))}
        </View>

        <Text style={styles.sectionTitle}>Afternoon</Text>
        <View style={styles.timeRow}>
          {timeSlots.afternoon.map((time) => renderTimeSlot(time, "PM"))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNavigation}
          disabled={!selectedTime}
        >
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
  timeContainer: {
    marginBottom: 20,
  } as ViewStyle,
  sectionTitle: {
    fontFamily: "SF Pro Display",
    color: "#6B7685",
    fontSize: 16,
    fontWeight: "300",
    marginBottom: 15,
    marginTop: 16,
  } as TextStyle,
  timeRow: {
    fontFamily: "SF Pro Display",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  } as ViewStyle,
  timeSlot: {
    width: "23%",
    aspectRatio: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E8EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,
  selectedTimeSlot: {
    backgroundColor: "#237AF2",
    borderColor: "#237AF2",
  } as ViewStyle,
  timeText: {
    fontSize: 14,
    color: "#222222",
    fontWeight: "500",
  } as TextStyle,
  selectedTimeText: {
    color: "white",
  } as TextStyle,
  buttonContainer: {
    marginTop: 200,
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

export default AppointmentTimePage;
