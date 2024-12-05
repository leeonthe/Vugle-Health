import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LOGO from '../../assets/images/logo/logo.svg'; 

type StartPageProps = NativeStackScreenProps<any, 'Start'>; 

const StartPage: React.FC<StartPageProps> = ({ navigation }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const shouldNavigate = true;
      if (shouldNavigate) {
        navigation.navigate('OnBoarding');
      }
    }, 2000);
  
    return () => clearTimeout(timeout);
  }, [navigation]);
  
  return (
    <View style={styles.container}>
      <LOGO />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default StartPage;
