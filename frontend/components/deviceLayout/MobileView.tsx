import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MobileView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <View style={styles.container}>{children}</View>;
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      padding: 16, // Mobile-specific padding
    },
  });
  
  export default MobileView;
