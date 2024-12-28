import { initiateLogin } from "../services/auth/authApi";

export class OAuthHandler {
  static async initiateLogin(
    platform: "mobile" | "web",
    setShowMobileView: Function,
    setAuthUrl: Function
  ) {
    try {
      const loginUrl = await initiateLogin(platform);

      if (platform === "web") {
        // Web users navigate directly
        window.location.href = loginUrl;
      } else {
        // Mobile users open WebView
        setAuthUrl(loginUrl);
        setShowMobileView(true);
      }
    } catch (error) {
      console.error("Error initiating login:", error);
    }
  }
}
