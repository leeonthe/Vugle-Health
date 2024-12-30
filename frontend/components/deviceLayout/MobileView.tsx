import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const MobileView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
  };
  
  const styles = StyleSheet.create({
    container: {
        flex: 1, 
        // paddingTop: 50,
    },
  });
  
  export default MobileView;
