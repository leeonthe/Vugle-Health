import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DesktopView: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>This is the Desktop View</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Optional background color for styling
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DesktopView;
