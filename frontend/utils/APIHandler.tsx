import { Linking } from 'react-native';

export class APIHandler {
  static backendUrl = 'http://localhost:8000';

  static async initiateLogin() {
    const loginUrl = `${this.backendUrl}/api/auth/login`;

    try {
      await Linking.openURL(loginUrl); // Opens the URL in the browser or appropriate app
    } catch (error) {
      console.error('Error initiating login:', error);
    }
  }
}
