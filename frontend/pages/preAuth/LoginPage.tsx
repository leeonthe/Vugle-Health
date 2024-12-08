import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import ConnectRecord from '../../assets/images/preAuth/loginPage/connect_record.svg';
import {APIHandler } from '../../utils/APIHandler'
import { WebView } from 'react-native-webview';

import { useDevice } from '../../hooks/useDevice';

const LoginPage: React.FC = () => {
  const { isMobile, isDesktop } = useDevice(); // Use both isMobile and isDesktop
  const [showWebView, setShowWebView] = useState(false); // For mobile WebView
  const [authUrl, setAuthUrl] = useState<string>(''); // OAuth URL

  /**
   * Handles login flow based on device type.
   */
  const handleLogin = async () => {
    try {
      console.log(`Device Type: ${isMobile ? 'Mobile' : isDesktop ? 'Desktop' : 'Unknown'}`);
      const platform  = isMobile ? 'mobile' : 'web';
      console.log(platform)
      await APIHandler.initiateLogin(platform, setShowWebView, setAuthUrl);
    } catch (error) {
      console.error('Error initiating login:', error);
    }
  };

  // Mobile: Show WebView for OAuth
  if (showWebView) {
    return (
      <WebView
        source={{ uri: authUrl }}
        // onMessage={handleWebViewMessage}
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
        {/* <View> */}
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
