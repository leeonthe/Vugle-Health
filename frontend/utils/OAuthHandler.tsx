export class OAuthHandler {
  static backendUrl = 'http://localhost:8000';

  static async initiateLogin(
    platform: 'mobile' | 'web',
    setShowMobileView: Function,
    setAuthUrl: Function
  ) {
    console.log("PLATFORM IS ", platform);
    const loginUrl = `${this.backendUrl}/api/auth/login?platform=${platform}`;

    try {
      if (platform === 'web') {
        // Web users navigate directly
        console.log('Cookies:', document.cookie);
        window.location.href = loginUrl;
      } else {
        // Mobile users open WebView
        setAuthUrl(loginUrl);
        setShowMobileView(true);
      }
    } catch (error) {
      console.error('Error initiating login:', error);
    }
  }
}
