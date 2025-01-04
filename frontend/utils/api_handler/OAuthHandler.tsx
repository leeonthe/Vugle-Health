export class OAuthHandler {
  // static backendUrl = 'http://localhost:8000';
  static backendUrl = 'http://  vugle-backend-v1.us-east-2.elasticbeanstalk.com';



  static async initiateLogin(
    platform: 'mobile' | 'web',
    setShowMobileView: Function,
    setAuthUrl: Function
  ) {
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
