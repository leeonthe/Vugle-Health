import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Back from "../../../../../assets/images/logo/back.svg";
import Edit from "../../../../../assets/images/postAuth/dexPage/appointmentPage/editButton.svg";

const AppointmentPatientInfoPage: React.FC = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [name, setName] = useState<string>("Robert Kim");
  const [dateOfBirth, setDateOfBirth] = useState<string>("02/18/1978");
  const [phoneNumber, setPhoneNumber] = useState<string>("(510) 836-5724");

  const navigation = useNavigation();

  // Retrieve `given_name` from AsyncStorage
  useEffect(() => {
    const loadFirstName = async () => {
      try {
        const storedName = await AsyncStorage.getItem("given_name");
        const storedLastName = await AsyncStorage.getItem("family_name");
        if (storedName) {
          setFirstName(storedName);
        }

        if (storedLastName) {
          setLastName(storedLastName);
        }
      } catch (error) {
        console.error("Error loading firstName from AsyncStorage:", error);
      }
    };

    loadFirstName();
  }, []);

  const handleNavigation = () => {
    navigation.navigate("AppointmentVisitReasonPage");
  };

  const navigateToHomePage = () => {
    navigation.goBack();
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
        <Text style={styles.title}>Patient Information </Text>
      </View>
      <View style={styles.infoBox}>
        {isEditingName ? (
          <>
            <View style={styles.infoRowWithEdit}>
              <View style={styles.infoRowColumn}>
                <Text style={styles.infoLabel}>Name</Text>
                <TextInput
                  style={styles.infoValueEditable}
                  value={`${firstName} ${lastName}`}
                  onChangeText={(text) => {
                    const [newFirstName, ...rest] = text.split(" ");
                    setFirstName(newFirstName);
                    setLastName(rest.join(" "));
                  }}
                  autoFocus
                />
              </View>
              <TouchableOpacity onPress={() => setIsEditingName(false)}>
                <Edit width={16} height={16} style={styles.editButton} />
              </TouchableOpacity>
            </View>
            <View style={styles.infoRowColumnWithoutEdit}>
              <Text style={styles.infoLabel}>Date of birth</Text>
              <TextInput
                style={[styles.infoValueEditable, styles.noUnderline]}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
              />
            </View>
            <View style={styles.infoRowColumnWithoutEdit}>
              <Text style={styles.infoLabel}>Phone number</Text>
              <TextInput
                style={[styles.infoValueEditable, styles.noUnderline]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRowWithEdit}>
              <View style={styles.infoRowColumn}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text
                  style={styles.infoValue}
                >{`${firstName} ${lastName}`}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditingName(true)}>
                <Edit width={16} height={16} style={styles.editButton} />
              </TouchableOpacity>
            </View>
            <View style={styles.infoRowColumnWithoutEdit}>
              <Text style={styles.infoLabel}>Date of birth</Text>
              <Text style={styles.infoValue}>{dateOfBirth}</Text>
            </View>
            <View style={styles.infoRowColumnWithoutEdit}>
              <Text style={styles.infoLabel}>Phone number</Text>
              <Text style={styles.infoValue}>{phoneNumber}</Text>
            </View>
          </>
        )}
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
  infoRowWithEdit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  } as ViewStyle,
  infoRowColumn: {
    flex: 1,
  } as ViewStyle,
  infoRowColumnWithoutEdit: {
    marginBottom: 16,
  } as ViewStyle,
  infoLabel: {
    color: "#6B7685",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  } as TextStyle,
  infoValue: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "500",
  } as TextStyle,
  infoValueEditable: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 2,
  } as TextStyle,
  noUnderline: {
    borderBottomWidth: 0,
  } as TextStyle,
  editButton: {
    marginLeft: 8,
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

export default AppointmentPatientInfoPage;
