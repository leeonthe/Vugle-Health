import * as AuthSession from 'expo-auth-session';

export class APIHandler {
  static backendUrl = 'http://localhost:8000';

  static async initiateLogin(platform: 'mobile' | 'web', setShowWebView: Function, setAuthUrl: Function) {
    const loginUrl = `${this.backendUrl}/api/auth/login?platform=${platform}`;

    try {
      if (platform === 'web') {
        console.log("CUrrnet web")
        // For web
        window.location.href = loginUrl;
      } else {
        console.log("CUrrnet mobile")
        setAuthUrl(loginUrl);
        setShowWebView(true); 

      }
    } catch (error) {
      console.error('Error initiating login:', error);
    }
  }
}
