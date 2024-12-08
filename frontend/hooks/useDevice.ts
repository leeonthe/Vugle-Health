import { DeviceDetector } from '../utils/DeviceDetector';
import { OrientationDetector } from '../utils/OrientationDetector';
import { DesktopOS, MobileOS } from '../enums/DeviceOS';

export interface DeviceState {
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
  mobileOS: MobileOS | undefined;
  desktopOS: DesktopOS | undefined;
  isLandscapeOrientation: boolean;
  isPortraitOrientation: boolean;
}
export const useDevice = (): DeviceState => {
  const deviceState: DeviceState = {
    isDesktop: DeviceDetector.isDesktopDevice(),
    isMobile: DeviceDetector.isMobileDevice(),
    isTablet: DeviceDetector.isTabletDevice(),
    mobileOS: DeviceDetector.getMobileOS(),
    desktopOS: DeviceDetector.getDesktopOS(),
    isLandscapeOrientation: OrientationDetector.isLandscape(),
    isPortraitOrientation: OrientationDetector.isPortrait(),
  };

  console.log('Device State in useDevice:', deviceState);
  return deviceState;
};
