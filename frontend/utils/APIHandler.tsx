import * as AuthSession from 'expo-auth-session';

export class APIHandler {
  static backendUrl = 'http://localhost:8000';

  static async initiateLogin(platform: 'mobile' | 'web') {
    const loginUrl = `${this.backendUrl}/api/auth/login?platform=${platform}`;

    try {
      if (platform === 'web') {
        // For web
        window.location.href = loginUrl;
      } else {
        // For mobile
        const redirectUri = AuthSession.makeRedirectUri({
          scheme: 'myapp', // Replace 'myapp' with your app's scheme
        });
        console.log('Redirect URI:', redirectUri);


        const result = await AuthSession.authorizeAsync({
          authUrl: loginUrl,
          returnUrl: redirectUri, // Required for mobile deep linking
        });

        if (result.type === 'success') {
          console.log('OAuth Successful:', result);
        } else {
          console.warn('OAuth Cancelled or Failed:', result);
        }
      }
    } catch (error) {
      console.error('Error initiating login:', error);
    }
  }
}
