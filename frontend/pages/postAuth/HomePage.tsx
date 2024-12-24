import React from 'react';
import styles from '@/styles/postAuthStyles/HomePageStyles';

import {

  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,

} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// hooks
import { useDisabilityRating } from '../../utils/hooks/useDisabilityRating';
import { useEligibleLetter } from '../../utils/hooks/useEligibleLetter';


// SVG for home 
import DisabilityIcon from '../../assets/images/postAuth/homePage/disability_icon.svg';
import CompensationIcon from '../../assets/images/postAuth/homePage/monthly_compensation.svg';
import NotificationIcon from '../../assets/images/postAuth/homePage/notification_icon.svg';

import Document from '../../assets/images/postAuth/homePage/document-icon.svg';
import CloseIcon from '../../assets/images/postAuth/homePage/closeIcon.svg';
import Home from '../../assets/images/postAuth/homePage/home-icon.svg';
import Explore from '../../assets/images/postAuth/homePage/explore_icon.svg';
import Consult from '../../assets/images/postAuth/homePage/consult-icon.svg';
import Loan from '../../assets/images/postAuth/homePage/loan-icon.svg';


function HomePage() {
  const navigation = useNavigation();

  const { data: disabilityData, isLoading: isDisabilityLoading, isError: isDisabilityError } = useDisabilityRating();
  const icn = disabilityData?.disability_rating?.data?.id;
  const { data: eligibleLettersData, isLoading: isEligibleLoading } = useEligibleLetter(icn || '');

  const combinedDisabilityRating = disabilityData?.disability_rating?.data?.attributes.combined_disability_rating;
  const monthlyAwardAmount = eligibleLettersData?.benefitInformation?.monthlyAwardAmount || { value: 0, currency: 'USD' };

  // Display currency symbols based on the currency code
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: monthlyAwardAmount.currency,
  }).format(monthlyAwardAmount.value);

  const billImagePath = '../../assets/postAuth/homePage/giBill.png'

  if (isDisabilityLoading || isEligibleLoading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
        <NotificationIcon style={styles.notificationIcon} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>
                Earn additional {'\n'}
                <Text style={styles.cardHeaderHighlight}>$28,511 </Text>
                benefits annually
              </Text>
              <CloseIcon />
            </View>
            <View style={styles.averageIncrease}>
              <Text style={styles.averageIncreaseText}>
                <Text style={styles.averageIncreaseHighlight}>Average increase </Text>
                for our veterans
              </Text>
            </View>
            <View style={styles.graphContainer}>
              <View style={styles.graphItem}>
                <View style={styles.barsContainer}>
                  <View style={styles.barGroup}>
                    <Text style={styles.barLabel}>60%</Text>
                    <View style={styles.barLow} />
                  </View>
                  <View style={styles.barGroup}>
                    <Text style={styles.barLabelHighlight}>90%</Text>
                    <View style={styles.barHigh} />
                  </View>
                </View>
                <Text style={styles.graphLabel}>Disability rating</Text>
              </View>
              <View style={[styles.graphItem, styles.graphItemMargin]}>
                <View style={styles.barsContainer}>
                  <View style={styles.barGroup}>
                    <Text style={styles.barLabel}>$1,362</Text>
                    <View style={styles.barLow} />
                  </View>
                  <View style={styles.barGroup}>
                    <Text style={styles.barLabelHighlight}>$3,737</Text>
                    <View style={styles.barHigh} />
                  </View>
                </View>
                <Text style={styles.graphLabel}>Monthly comp.</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('DexStartPage')}
          >
            <Text style={styles.buttonText}>How much I can earn?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <DisabilityIcon style={styles.infoIcon} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Disability rating</Text>
                <Text style={styles.infoValue}>
                  {combinedDisabilityRating !== undefined ? `${combinedDisabilityRating}%` : 'NA%'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.infoRight}
              onPress={() => navigation.navigate('StatsDisabilityPage')}
            >
              <Text style={styles.viewText}>View</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <CompensationIcon style={styles.infoIcon} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Monthly compensation</Text>
                <Text style={styles.infoValue}>
                  {/* {`$${monthlyAwardAmount.value.toFixed(2)} ${monthlyAwardAmount.currency}`} */}
                  {formattedAmount}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.infoRight}
              onPress={() => navigation.navigate('StatsCompPage')}
            >
              <Text style={styles.viewText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Claims Status */}
        <View style={styles.claimsStatusContainer}>
          <View style={styles.claimsStatusHeader}>
            <Text style={styles.claimsStatusTitle}>Claims status</Text>
            <View style={styles.claimsStatusIcon} />
          </View>
          <View style={styles.claimsStatusContent}>
            <View style={styles.claimsStatusRow}>
              <View style={styles.claimStatusIconContainer}>
                <Text>\ud83d\udce8</Text>
              </View>
              <View style={styles.claimsStatusTextContainer}>
                <Text style={styles.claimsStatusTextGray}>Aug 4 Sunday</Text>
                <Text style={styles.claimsStatusTextBlack}>
                  VA received your medical evidence
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* My Documents */}
        <View style={styles.myDocumentsContainer}>
          <View style={styles.myDocumentsContent}>
            <View style={styles.myDocumentsRow}>
              <View style={styles.myDocumentsTextContainer}>
                <Text style={styles.myDocumentsTitle}>My documents</Text>
                <Text style={styles.myDocumentsSubtitle}>Service treatment records</Text>
                <Text style={styles.myDocumentsSubtitle}>Medical records</Text>
              </View>
              <Document style={styles.myDocumentsIcon} />
            </View>
          </View>
        </View>

        {/* Current Resources */}
        <View style={styles.currentResourcesContainer}>
          <View style={styles.currentResourcesHeader}>
            <Text style={styles.currentResourcesTitle}>Current resources</Text>
            <View style={styles.currentResourcesIcon} />
          </View>
          <View style={styles.currentResourcesContent}>
            {/* GI Bill */}
            <View style={styles.resourceRow}>
              <View style={styles.resourceRowContent}>
                <Image
                  style={styles.resourceIcon}
                  source={require('../../assets/images/postAuth/homePage/giBill.png')}
                    //  source={require(billImagePath)}
                />
                <View style={styles.resourceTextContainer}>
                  <Text style={styles.resourceTitle}>GI Bill 2024</Text>
                  <Text style={styles.resourceAmount}>$2,680</Text>
                </View>
              </View>
              <View style={styles.resourceIconArrow} />
            </View>

            {/* Housing Support */}
            <View style={styles.resourceRow}>
              <View style={styles.resourceRowContent}>
                <Image
                  style={styles.resourceIcon}
                  source={require('../../assets/images/postAuth/homePage/HomeLoan.png')}
                />
                <View style={styles.resourceTextContainer}>
                  <Text style={styles.resourceTitle}>VA Home Loan Guaranty</Text>
                  <Text style={styles.resourceAmount}>$1,808</Text>
                </View>
              </View>
              <View style={styles.resourceIconArrow} />
            </View>

            {/* Travel Reimbursement */}
            <View style={styles.resourceRow}>
              <View style={styles.resourceRowContent}>
                <Image
                  style={styles.resourceIcon}
                  source={require('../../assets/images/postAuth/homePage/Reimburse.png')}
                />
                <View style={styles.resourceTextContainer}>
                  <Text style={styles.resourceTitle}>Travel reimbursement</Text>
                  <Text style={styles.resourceAmount}>$586</Text>
                </View>
              </View>
              <View style={styles.resourceIconArrow} />
            </View>

            {/* Explore More Benefits */}
            <View style={styles.exploreMoreContainer}>
              <View style={styles.exploreMoreContent}>
                <View style={styles.exploreMoreIconContainer}>
                  <View style={styles.exploreMoreIcon} />
                </View>
                <Text style={styles.exploreMoreText}>
                  Explore more benefits you’re eligible
                </Text>
                <View style={styles.resourceIconArrow} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomNavigation}>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('HomePage')}
        >
          <Home style={styles.navIcon} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('DexPage')}
        >
          <Consult style={styles.navIcon} />
          <Text style={styles.navTextInactive}>Consult</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ExplorePageScreen')}
        >
          <Explore style={styles.navIcon} />
          <Text style={styles.navTextInactive}>Benefits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('LoanPageScreen')}
        >
          <Loan style={styles.navIcon} />
          <Text style={styles.navTextInactive}>Loan</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

export default HomePage;
