import React from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useDisabilityRating } from "@/utils/hooks/auth_api/useDisabilityRating";
import { useNavigation } from "@react-navigation/native";
import Back from "../../../assets/images/logo/back.svg";
const DisabilityDataPage: React.FC = () => {
  const navigation = useNavigation();
  const navigateToHomePage = () => {
    navigation.goBack();
  };

  const { data, isLoading, isError, refetch } = useDisabilityRating();

  return (
    <View style={styles.container}>
      <View style={styles.back}>
        <TouchableOpacity onPress={navigateToHomePage}>
          <Back width={24} height={24} />
        </TouchableOpacity>
      </View>

      <Button title="Fetch Disability Data" onPress={() => refetch()} />

      {isLoading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}

      {isError && (
        <Text style={styles.errorText}>
          Something went wrong while fetching the disability data.
        </Text>
      )}

      {data && (
        <View style={styles.dataContainer}>
          <Text style={styles.headerText}>
            Combined Disability Rating:{" "}
            {data.disability_rating.data.attributes.combined_disability_rating}%
          </Text>
          <Text style={styles.subHeaderText}>
            Effective Date:{" "}
            {data.disability_rating.data.attributes.combined_effective_date}
          </Text>

          <FlatList
            data={data.disability_rating.data.attributes.individual_ratings}
            keyExtractor={(item) => item.disability_rating_id}
            renderItem={({ item }) => (
              <View style={styles.ratingItem}>
                <Text>Diagnostic Name: {item.diagnostic_type_name}</Text>
                <Text>Rating Percentage: {item.rating_percentage}%</Text>
                <Text>Effective Date: {item.effective_date}</Text>
                <Text>Decision: {item.decision}</Text>
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
    backgroundColor: "#f5f5f5",
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
    color: "red",
    marginTop: 20,
    textAlign: "center",
  },
  dataContainer: {
    marginTop: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    marginBottom: 20,
  },
  ratingItem: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
});

export default DisabilityDataPage;
