import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { NavigationParamList } from './NavigationParamList';
import StartPage from '../pages/preAuth/StartPage';
import OnBoardingPage from '../pages/preAuth/OnBoardingPage';
import LoginPage from '../pages/preAuth/LoginPage';
import Welcome from '../app/Welcome'; 
import HomePage from '../pages/postAuth/preChatbot/HomePage'
import DexStartPage from '../pages/postAuth/preChatbot/DexStartPage'
import DexPage from '../pages/postAuth/postChatbot/chatbot/DexPage';
import PotentialConditionsPage from '../pages/postAuth/postChatbot/DexNavigationPages/PotentialConditionsPage';
import HospitalPageScreen from '../pages/postAuth/postChatbot/DexNavigationPages/HospitalPageScreen';
import HospitalDetailScreen from '../pages/postAuth/postChatbot/DexNavigationPages/HospitalDetailScreen';
import AppointmentPatientInfoPage from '@/pages/postAuth/postChatbot/DexNavigationPages/AppointmentPges/AppointmentPatientInfoPage';
import AppointmentVisitReasonPage from '@/pages/postAuth/postChatbot/DexNavigationPages/AppointmentPges/AppointmentVisitReasonPage';
import AppointmentDatePage from '@/pages/postAuth/postChatbot/DexNavigationPages/AppointmentPges/AppointmentDatePage';
import AppointmentTimePage from '@/pages/postAuth/postChatbot/DexNavigationPages/AppointmentPges/AppointmentTimePage';
import AppointmentMessagePage from '@/pages/postAuth/postChatbot/DexNavigationPages/AppointmentPges/AppointmentMessagePage';
import AppointmentSummaryPage from '@/pages/postAuth/postChatbot/DexNavigationPages/AppointmentPges/AppointmentSummaryPage';
import DexEndPage from '@/pages/postAuth/postChatbot/chatbot/DexEndPage';
import DisabilityDataPage from '@/pages/postAuth/preChatbot/DisabilityDataPage';
import MonthlyCompensation from '@/pages/postAuth/preChatbot/MonthlyCompensation';

const Stack = createNativeStackNavigator();

const Router: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Start"> 
      {/* PreAuth Pages */}
      <Stack.Screen name="Start" component={StartPage} options={{ headerShown: false }} />
      
      <Stack.Screen name="OnBoarding" component={OnBoardingPage} options={{ headerShown: false }}/>
      <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>

      {/* PostAuth Pages */}
      {/* PostChatbot Pages */}
      <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} /> 
      <Stack.Screen name="HomePage" component={HomePage} options={{headerShown: false}} />
      <Stack.Screen name="DisabilityDataPage" component={DisabilityDataPage} options={{headerShown: false}} />
      <Stack.Screen name="MonthlyCompensation" component={MonthlyCompensation} options={{headerShown: false}} />

      {/* PreChatbot Pages */}
      <Stack.Screen name="DexStartPage" component={DexStartPage} options={{headerShown: false}} />
      <Stack.Screen name="DexPage" component={DexPage} options={{headerShown: false}} />
      <Stack.Screen name="PotentialConditionsPage" component={PotentialConditionsPage} options={{headerShown: false}} />
      <Stack.Screen name="HospitalPageScreen" component={HospitalPageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HospitalDetailScreen" component={HospitalDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AppointmentPatientInfoPage" component={AppointmentPatientInfoPage} options={{ headerShown: false }} />
      <Stack.Screen name="AppointmentVisitReasonPage" component={AppointmentVisitReasonPage} options={{ headerShown: false }} />
      <Stack.Screen name="AppointmentDatePage" component={AppointmentDatePage} options={{ headerShown: false }} />
      <Stack.Screen name="AppointmentTimePage" component={AppointmentTimePage} options={{ headerShown: false }} />
      <Stack.Screen name="AppointmentMessagePage" component={AppointmentMessagePage} options={{ headerShown: false }} />
      <Stack.Screen name="AppointmentSummaryPage" component={AppointmentSummaryPage} options={{ headerShown: false }} />
      <Stack.Screen name="DexEndPage" component={DexEndPage} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default Router;
