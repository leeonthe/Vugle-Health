import React from 'react';
import 'react-native-gesture-handler';
import Router from './router/Router'; // Centralized navigation stack
import MobileView from './components/deviceLayout/MobileView';
import DesktopView from './components/deviceLayout/DesktopView';
import { useDevice } from './utils/hooks/global/useDevice';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

const queryClient = new QueryClient(); // Initialize QueryClient

const App: React.FC = () => {
  const { isMobile, isDesktop } = useDevice();

  
  return (
    <QueryClientProvider client={queryClient}>
      {isMobile ? (
        <MobileView>
          <Router />
        </MobileView>
      ) : (
        <DesktopView>
          <Router />
        </DesktopView>
      )}
    </QueryClientProvider>
  );
};

export default App;
