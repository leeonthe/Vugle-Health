export class APIHandler {
    static backendUrl = 'http://localhost:8000';
  
    static initiateLogin() {
      const loginUrl = `${this.backendUrl}/api/auth/login`;
      window.location.href = loginUrl; 
    }
  }
  