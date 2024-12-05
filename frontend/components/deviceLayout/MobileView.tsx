import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MobileView: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>This is the Mobile View</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f7fa', // Optional background color for styling
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796b',
  },
});

export default MobileView;
