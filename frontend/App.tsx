import React from 'react';
import 'react-native-gesture-handler';
import Router from './router/Router'; // Centralized navigation stack
import MobileView from './components/deviceLayout/MobileView';
import DesktopView from './components/deviceLayout/DesktopView';
import { useDevice } from './hooks/useDevice';

const App: React.FC = () => {
  const { isMobile } = useDevice();

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
