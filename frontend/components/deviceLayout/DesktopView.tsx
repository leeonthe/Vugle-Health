import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

const DesktopView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set the browser window to a fixed size (iPhone dimensions)
      window.resizeTo(393, 852);

      // Center the window on the screen
      const xPos = screen.width / 2 - 393 / 2;
      const yPos = screen.height / 2 - 852 / 2;
      window.moveTo(xPos, yPos);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.simulator}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  simulator: {
    width: 393, 
    height: 852, 
    borderWidth: 2,
    borderColor: '#ccc', 
    borderRadius: 20,
    backgroundColor: '#fff', 
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', 
    overflow: 'hidden',
  },
});

export default DesktopView;
