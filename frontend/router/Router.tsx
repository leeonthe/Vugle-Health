import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { NavigationParamList } from './NavigationParamList';
import StartPage from '../pages/preAuth/StartPage';
import OnBoardingPage from '../pages/preAuth/OnBoardingPage';
import LoginPage from '../pages/preAuth/LoginPage';
import WelcomePage from '../pages/postAuth/WelcomePage'; 

// import ChatbotPage from '../pages/chatbot/ChatbotPage';
// import LobbyPage from '../pages/postAuth/LobbyPage';

const Stack = createNativeStackNavigator();

const Router: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Start"> 
      {/* PreAuth Pages */}
      <Stack.Screen name="Start" component={StartPage} options={{ headerShown: false }} />
      <Stack.Screen name="OnBoarding" component={OnBoardingPage} options={{ headerShown: false }}/>
      <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>

      {/* PostAuth Pages */}
      <Stack.Screen name="Welcome" component={WelcomePage} options={{ headerShown: false }} /> 
      {/* <Stack.Screen name="Lobby" component={LobbyPage} /> */}
      {/* <Stack.Screen name="Chatbot" component={ChatbotPage} /> */}
    </Stack.Navigator>
  );
};

export default Router;
