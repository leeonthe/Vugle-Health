import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import DischargeStatus from '../../assets/assets-userStart/Discharge_status.svg';
// import ServiceTreatment from '../../assets/images/logo/logo.svg';
// import MedicalBook from '../../assets/assets-userStart/Medical_Book.svg';
// import BenefitInfo from '../../assets/assets-userStart/Benefits_info.svg';
// import Lock from '../../assets/assets-userStart/lock.svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type RootStackParamList = {
  Start: undefined;
  OnBoarding: undefined;
  Login: undefined;
  Welcome: undefined;
  Home: undefined;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const UserWelcomePage: React.FC = () => {
  const navigation = useNavigation<NavigationProp>(); // No explicit typing needed

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome TEST</Text>
      <Text style={styles.subtitle}>We thank you for your service.</Text>

      <View style={styles.listContainer}>
        {/* <View style={styles.listItem}>
          <DischargeStatus width={20} height={20} style={styles.icon} />
          <Text style={styles.listItemText}>Discharge status</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View> */}
        <View style={styles.divider} />
        {/* <View style={styles.listItem}>
          <ServiceTreatment width={20} height={20} style={styles.icon} />
          <Text style={styles.listItemText}>Service Treatment Records</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View> */}
        <View style={styles.divider} />
        {/* <View style={styles.listItem}>
          <MedicalBook width={20} height={20} style={styles.icon} />
          <Text style={styles.listItemText}>VA Medical Records</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View> */}
        <View style={styles.divider} />
        {/* <View style={styles.listItem}>
          <BenefitInfo width={20} height={20} style={styles.icon} />
          <Text style={styles.listItemText}>Benefits Information</Text>
          <Text style={styles.checkmark}>✓</Text>
        </View> */}
      </View>

      <View style={styles.infoContainer}>
        {/* <Lock width={24} height={24} style={styles.icon} /> */}
        <Text style={styles.infoText}>
          We use 128-bit encryption for added security and do not share your data.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.replace('Home')} // Navigate to "Home" as per the Router
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '400',
    alignSelf: 'flex-start',
    marginTop: 130,
    marginBottom: 13,
  },
  subtitle: {
    fontSize: 27,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 40,
  },
  listContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F5F8FE',
    borderRadius: 16,
    marginBottom: 30,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E1E1E1',
  },
  listItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7685',
  },
  checkmark: {
    fontSize: 16,
    color: '#5CB297',
  },
  icon: {
    marginRight: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 50,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'left',
  },
  continueButton: {
    backgroundColor: '#237AF2',
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default UserWelcomePage;
