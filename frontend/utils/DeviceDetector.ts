import { Platform, Dimensions } from 'react-native';
import { DesktopOS, MobileOS } from '../enums/DeviceOS';

export const DeviceDetector = {
  isMobileDevice(): boolean {
    const { width } = Dimensions.get('window');

    // Native platforms
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return true;
    }

    // Web platform: use screen width to differentiate
    if (Platform.OS === 'web') {
      return width <= 768; // Assume width <= 768px as mobile
    }

    return false; 
  },

  isTabletDevice(): boolean {
    const { width, height } = Dimensions.get('window');
    const aspectRatio = Math.min(width, height) / Math.max(width, height);

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return Math.min(width, height) > 600 && aspectRatio > 0.5;
    }

    if (Platform.OS === 'web') {
      return width > 768 && width <= 1024; 
    }

    return false;
  },

  isDesktopDevice(): boolean {
    // Consider as desktop if Platform.OS is web and width > 1024px
    if (Platform.OS === 'web') {
      const { width } = Dimensions.get('window');
      return width > 1024;
    }

    return false; 
  },

  getMobileOS(): MobileOS | undefined {
    if (this.isMobileDevice()) {
      if (Platform.OS === 'android') return MobileOS.Android;
      if (Platform.OS === 'ios') return MobileOS.iOS;
      return MobileOS.Unknown;
    }
    return undefined;
  },

  getDesktopOS(): DesktopOS | undefined {
    if (this.isDesktopDevice()) {
      const platform = typeof navigator !== 'undefined' ? navigator.platform.toLowerCase() : '';
      if (platform.includes('win')) return DesktopOS.Windows;
      if (platform.includes('mac')) return DesktopOS.MacOS;
      if (platform.includes('x11') || platform.includes('unix')) return DesktopOS.Unix;
      if (platform.includes('linux')) return DesktopOS.Linux;
      return DesktopOS.Unknown;
    }
    return undefined;
  },
};
