export class APIHandler {
  static backendUrl = 'http://localhost:8000';

  static async getOAuthUrl(): Promise<string> {
    try {
      const response = await fetch(`${this.backendUrl}/api/auth/login`);
      if (!response.ok) throw new Error('Failed to fetch OAuth URL');
      return response.url;
    } catch (error) {
      console.error('Error fetching OAuth URL:', error);
      throw error;
    }
  }

  static async initiateLogin(platform: 'mobile' | 'web', setShowWebView: Function, setAuthUrl: Function) {
    try {
      const authUrl = await this.getOAuthUrl();

      if (platform === 'web') {
        setShowWebView(true);
        console.log('Redirecting to OAuth in browser:', authUrl);
        window.location.href = authUrl; // Desktop browser redirect
      } else if (platform === 'mobile') {
        console.log('Opening OAuth in WebView:', authUrl);
        setAuthUrl(authUrl);
        setShowWebView(true); // Mobile WebView
      } else {
        throw new Error('Unsupported platform');
      }
    } catch (error) {
      console.error('Error initiating login:', error);
    }
  }
}
