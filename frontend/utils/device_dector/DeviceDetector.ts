import { Platform, Dimensions } from 'react-native';
import { DesktopOS, MobileOS } from '../../enums/DeviceOS';
export const DeviceDetector = {
  isMobileDevice(): boolean {
    const { width } = Dimensions.get('window');
    const isMobile = (Platform.OS === 'ios' || Platform.OS === 'android') || (Platform.OS === 'web' && width <= 768);
    // console.log('isMobileDevice:', isMobile, 'Platform:', Platform.OS, 'Width:', width);
    return isMobile;
  },

  isTabletDevice(): boolean {
    const { width, height } = Dimensions.get('window');
    const aspectRatio = Math.min(width, height) / Math.max(width, height);
    const isTablet = (Platform.OS === 'ios' || Platform.OS === 'android') && Math.min(width, height) > 600 && aspectRatio > 0.5;
    // console.log('isTabletDevice:', isTablet, 'Platform:', Platform.OS, 'Width:', width, 'Height:', height, 'AspectRatio:', aspectRatio);
    return isTablet;
  },

  isDesktopDevice(): boolean {
    if (Platform.OS === 'web') {
      const { width } = Dimensions.get('window');
      const isDesktop = width > 1024;
      // console.log('isDesktopDevice:', isDesktop, 'Platform:', Platform.OS, 'Width:', width);
      return isDesktop;
    }
    return false;
  },

  getMobileOS(): MobileOS | undefined {
    const mobileOS = this.isMobileDevice()
      ? Platform.OS === 'android'
        ? MobileOS.Android
        : Platform.OS === 'ios'
        ? MobileOS.iOS
        : MobileOS.Unknown
      : undefined;
    // console.log('getMobileOS:', mobileOS, 'Platform:', Platform.OS);
    return mobileOS;
  },

  getDesktopOS(): DesktopOS | undefined {
    const desktopOS =
      this.isDesktopDevice() && typeof navigator !== 'undefined'
        ? navigator.platform.toLowerCase().includes('win')
          ? DesktopOS.Windows
          : navigator.platform.toLowerCase().includes('mac')
          ? DesktopOS.MacOS
          : navigator.platform.toLowerCase().includes('x11') || navigator.platform.toLowerCase().includes('unix')
          ? DesktopOS.Unix
          : navigator.platform.toLowerCase().includes('linux')
          ? DesktopOS.Linux
          : DesktopOS.Unknown
        : undefined;
    // console.log('getDesktopOS:', desktopOS, 'Platform:', typeof navigator !== 'undefined' ? navigator.platform : 'Unknown');
    return desktopOS;
  },
};
