import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Back from '../../assets/images/logo/back.svg'; 
import Logo from '../../assets/images/logo/dexLogo.svg'; 

const DexStartPage: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('Guest');
  const [showInitialButton, setShowInitialButton] = useState<boolean>(true);
  const navigation = useNavigation();

  // Retrieve `given_name` from AsyncStorage
  useEffect(() => {
    const loadFirstName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('given_name');
        if (storedName) {
          setFirstName(storedName);
        }
      } catch (error) {
        console.error('Error loading firstName from AsyncStorage:', error);
      }
    };

    loadFirstName();
  }, []);

  const navigateToHomePage = () => {
    navigation.goBack();
  };

  const navigateToDex = () => {
    navigation.navigate('DexPage');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.back}>
        <TouchableOpacity onPress={navigateToHomePage}>
          <Back width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}></View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Meet </Text>
        <Text style={styles.titleHighlight}>Dex,</Text>
        <Text style={styles.title}>Your AI compensation buddy.</Text>
      </View>

      <Animatable.View animation="fadeIn" duration={1000} style={styles.logoContainer}>
        <View style={styles.logoBackground}>
          <Logo style={styles.logo} />
        </View>
      </Animatable.View>

      <View style={styles.chatContainer}>
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          delay={1000}
          style={styles.messageContainer}
        >
          <Text style={styles.messageText}>Hello, {firstName} 👋</Text>
        </Animatable.View>

        <Animatable.View
          animation="fadeIn"
          duration={1000}
          delay={2000}
          style={styles.messageContainer}
        >
          <Text style={styles.messageText}>
            I will help you understand your condition, evaluate the best
            approach, and file out your application.
          </Text>
        </Animatable.View>

        <Animatable.View
          animation="fadeIn"
          duration={1000}
          delay={3000}
          style={styles.messageContainer}
        >
          <Text style={styles.messageText}>
            After that, I will guide you through the rest of the claim process!
          </Text>
        </Animatable.View>
      </View>

      {showInitialButton && (
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          delay={4000}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={navigateToDex}
          >
            <Text style={styles.buttonText}>Sounds good!</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: 'white',
      padding: 16,
    } as ViewStyle, 
    back: {
      marginTop: 80,
      marginLeft: 10,
    } as ViewStyle,
    header: {
      width: '100%',
      height: 54,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,
    titleContainer: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 45,
      marginTop: -20,
      marginLeft: 10,
    } as ViewStyle,
    title: {
      color: '#222222',
      fontSize: 24,
      fontFamily: 'SF Pro Display',
      fontWeight: '600',
      lineHeight: 38,
    } as TextStyle, // Explicitly typed as TextStyle
    titleHighlight: {
      color: '#3182F6',
      fontSize: 24,
      fontFamily: 'SF Pro Display',
      fontWeight: '600',
      lineHeight: 36,
    } as TextStyle,
    logoContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginBottom: 10,
      marginLeft: 10,
    } as ViewStyle,
    logoBackground: {
      width: 36,
      height: 36,
      backgroundColor: '#F6F6F6',
      borderRadius: 24,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    logo: {
      width: 24,
      height: 24,
    } as ImageStyle,
    chatContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 2,
      marginBottom: 150,
      marginLeft: 10,
    } as ViewStyle,
    messageContainer: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: '#F5F6F8',
      borderRadius: 16,
      alignItems: 'flex-start',
      padding: 16,
      marginBottom: 8,
      maxWidth: '80%',
    } as ViewStyle,
    messageText: {
      color: '#323D4C',
      fontSize: 16,
      fontFamily: 'SF Pro',
      fontWeight: '400',
      lineHeight: 28,
      wordWrap: 'break-word',
    } as TextStyle,
    buttonContainer: {
      marginTop: 16,
      alignItems: 'center',
    } as ViewStyle,
    button: {
      width: 357,
      height: 52,
      backgroundColor: '#237AF2',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'SF Pro Display',
      fontWeight: '500',
      lineHeight: 16,
    } as TextStyle,
  });
  

export default DexStartPage;
