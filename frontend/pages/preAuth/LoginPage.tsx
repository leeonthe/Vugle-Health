import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
  
} from 'react-native';
import ConnectRecord from '../../assets/images/preAuth/loginPage/connect_record.svg';
import {OAuthHandler } from '../../utils/OAuthHandler'
import { useDevice } from '../../utils/hooks/useDevice';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LoginPage: React.FC = () => {
  const { isMobile } = useDevice(); 
  const [showMobileView, setShowMobileView] = useState(false); // For mobile WebView
  const [authUrl, setAuthUrl] = useState<string>(''); 
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const platform = isMobile ? 'mobile' : 'web';
      console.log('Platform:', platform);
      await OAuthHandler.initiateLogin(platform, setShowMobileView, setAuthUrl);
    } catch (error) {
      console.error('Error initiating login:', error);
    }
  };

  


  
  let hasNavigated = false; // Handling duplicate navigation


  const handleMobileViewNavigation = async (navState: any) => {
    const { url } = navState;

    // Only process URLs that indicate a successful login
    if (!url.includes('/success') && !url.includes('/Welcome')) {
      return;
    }

    if (hasNavigated) {
      console.log('Navigation already handled, skipping...');
      return;
    }

    console.log('Processing navigation URL:', url);

    const urlParams = new URLSearchParams(new URL(url).search);
    const accessToken = urlParams.get('access_token');
    const idToken = urlParams.get('id_token');

    console.log('ACCESS TOKEN GOT IN LOGINPAGE:', accessToken);
    console.log('ID TOKEN GOT IN LOGINPAGE:', idToken);

    if (accessToken && idToken) {
      try {
        hasNavigated = true; // Prevent further processing
        console.log('Access Token Extracted:', accessToken);

        // Save tokens to AsyncStorage
        await AsyncStorage.setItem('access_token', accessToken);
        await AsyncStorage.setItem('id_token', idToken);

        // Confirm tokens are stored
        const storedAccessToken = await AsyncStorage.getItem('access_token');
        const storedIdToken = await AsyncStorage.getItem('id_token');
        console.log('Stored Access Token:', storedAccessToken);
        console.log('Stored ID Token:', storedIdToken);

        // Navigate to Welcome page
        navigation.navigate('Welcome');
      } catch (error) {
        console.error('Error storing tokens:', error);
        hasNavigated = false; // Reset navigation state on error
      }
    } else {
      console.warn('Access Token or ID Token not found in URL');
    }
  };

  
  

  

  if (showMobileView) {
    return (
      <WebView
        source={{ uri: authUrl }}
        onNavigationStateChange={handleMobileViewNavigation}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={{ marginTop: 20 }}
      />
    );
  }
  

  

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <ConnectRecord />
      </View>

      <Text style={styles.title}>Connect your records</Text>
      <Text style={styles.subtitle}>
        We utilize VA.gov for a faster and efficient information collection.
        Information will be stored securely and we will not share your data.
      </Text>

      <View style={styles.continueContainer}>
        <Text style={styles.text}>
          By continuing, you agree to our{' '}
          <Text style={styles.link}>Privacy Policy</Text>
          {' '}and{' '}
          <Text style={styles.link}>Terms of Service</Text>.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {/* <View style={styles.buttonContent}> */}
        <Text style={styles.buttonText}>VA Continue with VA.gov</Text>
        {/* </View> */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  svgContainer: {
    paddingTop: 160,
    marginBottom: 50,
  },
  title: {
    color: '#0B0B0E',
    fontFamily: 'SF Pro Display',
    width: '100%',
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    width: '100%',
    fontFamily: 'SF Pro',
    fontSize: 14,
    color: '#636467',
    textAlign: 'center',
    paddingHorizontal: 42,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 70,
  },
  button: {
    width: '90%',
    backgroundColor: '#162E52',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 100,  
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueContainer: {
    width: '100%',
    textAlign: 'center',
    color: '#636467',
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    lineHeight: 20,
  },
  text: {
    color: '#636467',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'SF Pro',
    fontWeight: '400',
    lineHeight: 18,
    marginBottom: 20,
  },
  link: {
    color: '#3182F6',
    fontSize: 12,
    fontFamily: 'SF Pro',
    fontWeight: '400',
    lineHeight: 18,
  },
});

export default LoginPage;
