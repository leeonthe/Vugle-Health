import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Back from '../../../../../assets/images/logo/back.svg'; 
import fetchAppointmentInfo from "@/utils/api_handler/fetchAppointmentInfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppointmentVisitReasonPage: React.FC = () => {
    const [branchOfMedicine, setBranchOfMedicine] = useState<string>("Loading...");
    const navigation = useNavigation();
  
    useEffect(() => {
      const getAppointmentInfo = async () => {
        try {
          const data = await fetchAppointmentInfo(); // Fetches branch_of_medicine and appointment_message
          const { branch_of_medicine, appointment_message } = data;
  
          if (branch_of_medicine) setBranchOfMedicine(branch_of_medicine);
  
          // Store in AsyncStorage
          await AsyncStorage.setItem("branchOfMedicine", branch_of_medicine || "General");
          await AsyncStorage.setItem("appointmentMessage", appointment_message || "");
        } catch (error) {
          console.error("Error fetching appointment information:", error);
          setBranchOfMedicine("General");
        }
      };
  
      getAppointmentInfo();
    }, []);
  
    const navigateToHomePage = () => {
      navigation.goBack();
    };
  
    const handleNavigation = () => {
      navigation.navigate("AppointmentDatePage");
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
          <Text style={styles.title}>Visit Reason</Text>
        </View>
  
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{branchOfMedicine}</Text>
        </View>
  
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
      infoBox: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
      } as ViewStyle,
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

export default AppointmentVisitReasonPage;
