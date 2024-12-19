import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DesktopView from '../components/deviceLayout/DesktopView'; 
import { useDevice } from '../hooks/useDevice'; 

const WelcomePage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>You have successfully logged in.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

const Welcome: React.FC = () => {
  const { isDesktop } = useDevice(); 

  if (isDesktop) {
    return (
      <DesktopView>
        <WelcomePage />
      </DesktopView>
    );
  }

  // Default view for mobile
  return <WelcomePage />;
};

export default Welcome;