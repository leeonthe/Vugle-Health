export class OAuthHandler {
  // Define the backend URL
  static backendUrl = 'https://vugle-backend-v1.com';

  static async initiateLogin(
    platform: 'mobile' | 'web',
    setShowMobileView: Function,
    setAuthUrl: Function
  ) {
    const loginUrl = `${this.backendUrl}/api/auth/login?platform=${platform}`;
    // const loginUrl = `${this.backendUrl}/api/test/`;


    // try {
    //   // Check backend health or response validity
    //   const response = await fetch(loginUrl, {
    //     method: 'GET',
    //     credentials: 'include', // Include cookies for session handling
    //   });

    //   if (!response.ok) {
    //     // Handle non-200 HTTP status codes
    //     const errorData = await response.json();
    //     console.error('Error from backend:', errorData);

    //     if (platform === 'web') {
    //       alert(
    //         `Error initiating login: ${
    //           errorData.error || 'An unexpected error occurred.'
    //         }`
    //       );
    //     } else {
    //       alert('Error initiating login on mobile. Please try again later.');
    //     }

    //     throw new Error(errorData.error || 'Failed to initiate login');
    //   }

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
  //   } catch (error) {
  //     console.error('Error initiating login:', error);

  //     // Fallback for critical errors
  //     // alert('An error occurred while starting the login process. Please try again later.');
  //   }
  }
}
