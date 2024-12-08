import React from 'react';
import 'react-native-gesture-handler';
import Router from './router/Router'; // Centralized navigation stack
import MobileView from './components/deviceLayout/MobileView';
import DesktopView from './components/deviceLayout/DesktopView';
import { useDevice } from './hooks/useDevice';
import { Platform, Dimensions } from 'react-native';

console.log('Platform Info:', Platform.OS);
console.log('Initial Dimensions:', Dimensions.get('window'));

const App: React.FC = () => {
  // const { isMobile } = useDevice();
  const { isMobile, isDesktop } = useDevice();
  console.log('useDevice Hook Output:', { isMobile, isDesktop });

  console.log('Rendering App with device type:', isMobile ? 'Mobile' : isDesktop ? 'Desktop' : 'Unknown');
  

  return isMobile ? (
    <MobileView>
      <Router />
    </MobileView>
  ) : (
    <DesktopView>
      <Router />
    </DesktopView>
  );
};

export default App;
