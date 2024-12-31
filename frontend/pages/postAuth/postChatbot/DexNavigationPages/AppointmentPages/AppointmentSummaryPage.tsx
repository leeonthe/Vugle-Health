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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import Back from "../../../../../assets/images/logo/back.svg";

const AppointmentSummaryPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hospitalName } = route.params as { hospitalName: string };

  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [visitReason, setVisitReason] = useState<string>("");

  useEffect(() => {
    const loadAppointmentData = async () => {
      try {
        // Load selected date
        const selectedDate = await AsyncStorage.getItem("selectedDate");
        const selectedTime = await AsyncStorage.getItem("selectedTime");

        if (selectedDate && selectedTime) {
          const dateObject = new Date(selectedDate);
          const formattedDate =
            `${dateObject.getMonth() + 1}`.padStart(2, "0") +
            `.${dateObject.getDate()}`.padStart(2, "0") +
            `(${dateObject.toLocaleDateString("en-US", { weekday: "long" })})`;

          setAppointmentDate(`${formattedDate}`);
          setAppointmentTime(`${selectedTime}`);
        }

        // Load patient name
        const firstName = await AsyncStorage.getItem("given_name");
        const lastName = await AsyncStorage.getItem("family_name");
        const fullName = `${firstName || ""} ${lastName || ""}`.trim();

        // Load visit reason
        const branchOfMedicine = await AsyncStorage.getItem("branchOfMedicine");

        setPatientName(fullName);
        setVisitReason(branchOfMedicine || "General");
      } catch (error) {
        console.error("Error loading appointment data:", error);
      }
    };

    loadAppointmentData();
  }, []);

  const navigateToHomePage = () => {
    navigation.goBack();
  };

  const handleNavigation = () => {
    navigation.navigate("DexEndPage");
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
        <Text style={styles.title}>{hospitalName}</Text>
      </View>

      {/* Appointment Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Appointment date</Text>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.detailValueDate}>
            <Text style={styles.dateText}>{appointmentDate}</Text>{" "}
            <Text style={styles.timeText}>{appointmentTime}</Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Patient</Text>
          <Text style={styles.detailValue}>{patientName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Visit reason</Text>
          <Text style={styles.detailValue}>{visitReason}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNavigation}>
          <Text style={styles.buttonText}>Confirm and schedule</Text>
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
    marginBottom: 20,
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
  detailsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 35,
    marginBottom: 70,
    marginHorizontal: 10,
  } as ViewStyle,
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  } as ViewStyle,
  dateRow: {
    fontSize: 14,
    color: "#7D7D7D",
    marginBottom: 12,
  } as ViewStyle,
  detailLabel: {
    fontSize: 14,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: "#7D7D7D",
  } as TextStyle,
  detailValue: {
    fontSize: 16,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: "#323D4C",
  } as TextStyle,
  detailValueDate: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  } as TextStyle,
  dateText: {
    color: "#000000",
  } as TextStyle,
  timeText: {
    color: "#7D7D7D",
    paddingLeft: 90,
  } as TextStyle,
  buttonContainer: {
    marginTop: 250,
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

export default AppointmentSummaryPage;
