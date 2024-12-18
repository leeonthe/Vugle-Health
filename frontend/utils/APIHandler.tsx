export class APIHandler {
  static backendUrl = 'http://localhost:8000';

  static async initiateLogin(
    platform: 'mobile' | 'web',
    setShowWebView: Function,
    setAuthUrl: Function
  ) {
    const loginUrl = `${this.backendUrl}/api/auth/login?platform=${platform}`;

    try {
      if (platform === 'web') {
        // Web users navigate directly
        window.location.href = loginUrl;
      } else {
        // Mobile users open WebView
        setAuthUrl(loginUrl);
        setShowWebView(true);
      }
    } catch (error) {
      console.error('Error initiating login:', error);
    }
  }

  static async handleOAuthCallback(platform: 'mobile' | 'web') {
    const callbackUrl = `${this.backendUrl}/api/auth/callback?platform=${platform}`;

    try {
      const response = await fetch(callbackUrl); // Fetch JSON response
      const data = await response.json();
      console.log("CALLBACK: ", data);
      console.log("REDIRECTURL: ", data.redirect_url);
      if (data.success) {
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
