import { OrientationType } from '../enums/OrientationType';

export const OrientationDetector = {
  getScreenOrientation(): OrientationType {
    if (typeof window !== 'undefined' && typeof screen !== 'undefined') {
      const supportedOrientation =
        screen.orientation?.type || (screen as any).mozOrientation || (screen as any).msOrientation;

      const safariFallback =
        !screen.orientation && matchMedia('(orientation: portrait)').matches
          ? 'portrait-primary'
          : 'landscape-primary';

      return (supportedOrientation || safariFallback || 'portrait-primary') as OrientationType;
    }

    // Default to portrait if screen is unavailable
    return 'portrait-primary';
  },

  isLandscape(): boolean {
    return ['landscape-primary', 'landscape-secondary'].includes(this.getScreenOrientation());
  },

  isPortrait(): boolean {
    return ['portrait-primary', 'portrait-secondary'].includes(this.getScreenOrientation());
  },
};
