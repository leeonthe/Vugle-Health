import React, { useEffect } from "react";
import DesktopView from "../components/deviceLayout/DesktopView";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// hooks
import { useDevice } from "../utils/hooks/global/useDevice";
import { useUserFirstName } from "../utils/hooks/auth_api/useUserFirstName";
import { useNavigation } from "@react-navigation/native";

// SVG
import DischargeStatus from "../assets/images/postAuth/WelcomePage/Discharge_status.svg";
import ServiceTreatment from "../assets/images/postAuth/WelcomePage/Service_treatment.svg";
import MedicalBook from "../assets/images/postAuth/WelcomePage/Medical_Book.svg";
import ServiceTreatmentRecords from "../assets/images/postAuth/WelcomePage/Service_treatment.svg";
import BenefitInfo from "../assets/images/postAuth/WelcomePage/Benefits_info.svg";
import Lock from "../assets/images/postAuth/WelcomePage/lock.svg";

// Pages
import HomePage from "../pages/postAuth/preChatbot/HomePage";
import DexStartPage from "../pages/postAuth/preChatbot/DexStartPage";
import DexPage from "../pages/postAuth/postChatbot/chatbot/DexPage";
import PotentialConditionsPage from "../pages/postAuth/postChatbot/DexNavigationPages/PotentialConditionsPage";
import MobileView from "../components/deviceLayout/MobileView";

type RootStackParamList = {
  HomePage: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "HomePage">;

interface UserStartScreenProps {
  route?: {
    params?: Record<string, unknown>;
  };
}

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const WelcomePage: React.FC<UserStartScreenProps> = ({ route }) => {
  const { isDesktop } = useDevice();

  
// 1011537977V693883
  useEffect(() => {
    const handleWebTokens = async () => {
      // Only handle this for web users
      if (isDesktop) {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("access_token");
        const idToken = urlParams.get("id_token");

        if (accessToken && idToken) {
          try {
            // Store tokens in AsyncStorage
            await AsyncStorage.setItem("access_token", accessToken);
            await AsyncStorage.setItem("id_token", idToken);

            console.log("Tokens stored in AsyncStorage for web users.");

            // Clean the URL after processing tokens
            const currentPath = window.location.pathname;
            const cleanUrl = `${window.location.origin}${currentPath}`;
            window.history.replaceState({}, document.title, cleanUrl);
          } catch (error) {
            console.error("Error storing tokens for web users:", error);
          }
        } else {
          console.warn(
            "Access Token or ID Token not found in the URL for web."
          );
        }
      }
    };

    handleWebTokens();
  }, [isDesktop]);

  const navigation = useNavigation<NavigationProp>();
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useUserFirstName();

  // Store user first_name
  useEffect(() => {
    const storeGivenName = async () => {
      if (userData?.given_name) {
        try {
          await AsyncStorage.setItem("given_name", userData.given_name);
          console.log(
            "Stored given_name in AsyncStorage:",
            userData.given_name
          );
        } catch (error) {
          console.error("Error storing given_name in AsyncStorage:", error);
        }
      }
    };

    storeGivenName();
  }, [userData]);

  if (isUserLoading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  if (isUserError) {
    return <Text style={styles.errorText}>Failed to load information.</Text>;
  }

  // const disabilityAttributes = disabilityData?.disability_rating?.data?.attributes;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Display Eligible Letters */}

      <Text style={styles.title}>
        Welcome {userData?.given_name || "Guest"}
      </Text>
      <Text style={styles.subtitle}>We thank you for your service.</Text>

      <View style={styles.listContainer}>
        <View style={styles.listItem}>
          <DischargeStatus width={20} height={20} style={{ marginRight: 10 }} />
          <Text style={styles.listItemText}>Discharge status</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.listItem}>
          <ServiceTreatment
            width={20}
            height={20}
            style={{ marginRight: 10 }}
          />
          <Text style={styles.listItemText}>Service Treatment Records</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.listItem}>
          <MedicalBook width={20} height={20} style={{ marginRight: 10 }} />
          <Text style={styles.listItemText}>VA Medical Records</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.listItem}>
          <BenefitInfo width={20} height={20} style={{ marginRight: 10 }} />
          <Text style={styles.listItemText}>Benefits Information</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.listItem}>
          <ServiceTreatmentRecords
            width={20}
            height={20}
            style={{ marginRight: 10 }}
          />
          <Text style={styles.listItemText}>Claims & Appeals Status</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Lock width={24} height={24} style={{ marginRight: 10 }} />
        <Text style={styles.infoText}>
          We use 128-bit encryption for added security and do not share your
          data.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate("HomePage")}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "400",
    alignSelf: "flex-start",
    marginTop: 60,
    marginBottom: 13,
  },
  subtitle: {
    fontSize: 27,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
    alignSelf: "flex-start",
    lineHeight: 36,
    wordWrap: "break-word",
    marginBottom: 40,
  },
  listContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "#F5F8FE",
    borderRadius: 16,
    marginBottom: 30,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  listItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E1E1E1",
    marginBottom: 3,
  },
  listItemText: {
    fontSize: 15,
    fontFamily: "SF Pro",
    fontWeight: "500",
    color: "#6B7685",
    flex: 1,
  },
  checkmark: {
    fontSize: 16,
    color: "#5CB297",
  },
  continueButton: {
    backgroundColor: "#237AF2",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  continueButtonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 50,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    textAlign: "left",
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },

  //TESTING STYLING
  disabilityContainer: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  eligibleLettersContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
});

const Welcome: React.FC = () => {
  const { isDesktop } = useDevice();
  const linking = {
    prefixes: ["http://localhost:8081"], // Base URL
    config: {
      screens: {
        WelcomePage: "Welcome", // Map WelcomePage to /Welcome
        HomePage: "HomePage", // Map HomePage to /HomePage
      },
    },
  };
  return (
    <QueryClientProvider client={queryClient}>
      {isDesktop ? (
        <DesktopView>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WelcomePage" component={WelcomePage} />
            <Stack.Screen name="HomePage" component={HomePage} />
            <Stack.Screen name="DexStartPage" component={DexStartPage} />
            <Stack.Screen name="DexPage" component={DexPage} />
            <Stack.Screen
              name="PotentialConditionsPage"
              component={PotentialConditionsPage}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </DesktopView>
      ) : (
        <MobileView>
          <Stack.Navigator
            initialRouteName="WelcomePage"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="WelcomePage" component={WelcomePage} />
            <Stack.Screen name="HomePage" component={HomePage} />
            <Stack.Screen name="DexStartPage" component={DexStartPage} />
            <Stack.Screen name="DexPage" component={DexPage} />
          </Stack.Navigator>
        </MobileView>
      )}
    </QueryClientProvider>
  );
};

export default Welcome;
