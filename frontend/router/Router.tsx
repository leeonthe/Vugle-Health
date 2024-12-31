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

const Stack = createNativeStackNavigator();

const Router: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Start"> 
      {/* PreAuth Pages */}
      <Stack.Screen name="Start" component={StartPage} options={{ headerShown: false }} />
      
      <Stack.Screen name="OnBoarding" component={OnBoardingPage} options={{ headerShown: false }}/>
      <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>

      {/* PostAuth Pages */}
      <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} /> 
      <Stack.Screen name="HomePage" component={HomePage} options={{headerShown: false}} />
      <Stack.Screen name="DexStartPage" component={DexStartPage} options={{headerShown: false}} />
      <Stack.Screen name="DexPage" component={DexPage} options={{headerShown: false}} />
      <Stack.Screen name="PotentialConditionsPage" component={PotentialConditionsPage} options={{headerShown: false}} />
      <Stack.Screen name="HospitalPageScreen" component={HospitalPageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HospitalDetailScreen" component={HospitalDetailScreen} options={{ headerShown: false }} />

    </Stack.Navigator>
  );
};

export default Router;
