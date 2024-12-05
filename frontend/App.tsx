import React from 'react';
import MobileView from './components/deviceLayout/MobileView';
import DesktopView from './components/deviceLayout/DesktopView';
import { useDevice } from './hooks/useDevice';

const App: React.FC = () => {
  const { isMobile } = useDevice();

  return isMobile ? <MobileView /> : <DesktopView />;
};

export default App;
