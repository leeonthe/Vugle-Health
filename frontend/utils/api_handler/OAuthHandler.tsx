export class OAuthHandler {
  // Define the backend URL
  static backendUrl = 'https://vugle-backend-v1.com';

  static async initiateLogin(
    platform: 'mobile' | 'web',
    setShowMobileView: Function,
    setAuthUrl: Function
  ) {
    const loginUrl = `${this.backendUrl}/api/auth/login?platform=${platform}`;

      // Successful login initiation
      if (platform === 'web') {
        // Redirect web users directly
        console.log('Redirecting to:', loginUrl);
        window.location.href = loginUrl;
      } else {
        // Mobile users open WebView
        setAuthUrl(loginUrl);
        setShowMobileView(true);
      }
  }
}
