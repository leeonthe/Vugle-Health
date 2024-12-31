import React from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useEligibleLetter } from '@/utils/hooks/auth_api/useEligibleLetter';
import Back from "../../../assets/images/logo/back.svg";
import { useNavigation } from "@react-navigation/native";
import { useDisabilityRating } from "@/utils/hooks/auth_api/useDisabilityRating";

const MonthlyCompensation: React.FC = () => {

 const {data: disabilityData, isLoading: disabilityLoading, isError: disabilityError} = useDisabilityRating();
 const icn = disabilityData?.disability_rating?.data?.id;
  const { data, isLoading, isError, refetch } = useEligibleLetter(icn);
  const navigation = useNavigation();
  const navigateToHomePage = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
        <View style={styles.back}>
        <TouchableOpacity onPress={navigateToHomePage}>
          <Back width={24} height={24} />
        </TouchableOpacity>
      </View>
      <Button title="Fetch Monthly Compensation" onPress={() => refetch()} />

      {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {isError && (
        <Text style={styles.errorText}>
          Monthly compensation data does not exist on this user!
        </Text>
      )}

      {data && (
        <View style={styles.dataContainer}>
          <Text style={styles.headerText}>Monthly Compensation Details</Text>
          <Text style={styles.detailText}>
            Monthly Award Amount: {data.benefitInformation.monthlyAwardAmount.value} {data.benefitInformation.monthlyAwardAmount.currency}
          </Text>
          <Text style={styles.detailText}>
            Service Connected Percentage: {data.benefitInformation.serviceConnectedPercentage}%
          </Text>
          <Text style={styles.detailText}>
            Effective Date: {data.benefitInformation.awardEffectiveDateTime}
          </Text>

          <Text style={styles.subHeaderText}>Military Services</Text>
          <FlatList
            data={data.militaryServices}
            keyExtractor={(item, index) => `${item.branch}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.serviceItem}>
                <Text>Branch: {item.branch}</Text>
                <Text>Service: {item.characterOfService}</Text>
                <Text>Entered: {item.enteredDateTime}</Text>
                <Text>Released: {item.releasedDateTime}</Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  back: {
    marginTop: 40,
    marginLeft: 10,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  dataContainer: {
    marginTop: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 5,
  },
  serviceItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
});

export default MonthlyCompensation;
