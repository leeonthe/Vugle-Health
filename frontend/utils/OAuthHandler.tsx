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

  static async handleOAuthCallback(platform: 'mobile' | 'web') {
    console.log('OAuth Callback Triggered for Platform:', platform);
    const callbackUrl = `${this.backendUrl}/api/auth/callback?platform=${platform}`;

    try {
      const response = await fetch(callbackUrl); // Fetch JSON response
      const data = await response.json();
      console.log("CALLBACK: ", data);
      console.log("REDIRECTURL: ", data.redirect_url);
      if (data.success) {
        if (platform === 'mobile') {
          // Save access_token locally for mobile
          const accessToken = data.access_token;
          console.log('Access Token Received:', accessToken);
          localStorage.setItem('access_token', accessToken); // Store token securely
        }
        return data.redirect_url; // Return the redirect URL
      } else {
        throw new Error('OAuth callback failed');
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }
}
