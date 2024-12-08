from django.shortcuts import redirect
from urllib.parse import urlencode
from django.conf import settings
from decouple import config
import requests
import base64
import os
import random
import string
import hashlib

class OAuthHandler:
    def __init__(self):
        self.client_id = config('VA_CLIENT_ID')
        self.client_secret = config('VA_CLIENT_SECRET')
        self.authorization_url = config('VA_AUTHORIZATION_URL')
        self.token_url = config('VA_TOKEN_URL')
        self.redirect_uri = config('VA_REDIRECT_URI')

    def generate_state(self):
        """Generate a random state parameter for CSRF protection."""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=16))


    def oauth_login(self, request):
        """Redirect to VA.gov authorization URL."""
        state = self.generate_state()
        request.session['oauth_state'] = state
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'profile openid offline_access disability_rating.read service_history.read veteran_status.read',
            'state': state,
        }
        print("OAUTH URL: ")
        return redirect(f"{self.authorization_url}?{urlencode(params)}")

    def oauth_callback(self, request):
        """Handle the callback and exchange the code for tokens."""
        code = request.GET.get('code')
        state = request.GET.get('state')
        saved_state = request.session.get('oauth_state')
        if not code or not state or state != saved_state:
            return redirect('/error') 

        token_response = requests.post(
            self.token_url,
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': self.redirect_uri,
            },
            headers={
                'Authorization': f"Basic {base64.b64encode(f'{self.client_id}:{self.client_secret}'.encode()).decode()}",
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        )

        if token_response.status_code != 200:
            return redirect('/error') 

        token_data = token_response.json()
        request.session['access_token'] = token_data.get('access_token')
        request.session['refresh_token'] = token_data.get('refresh_token')

        # Redirect to the frontend on success
        # return redirect(f"http://localhost:8081/?access_token={token_data.get('access_token')}&refresh_token={token_data.get('refresh_token')}")
        return redirect(f"http://localhost:8081/?success=true")



def oauth_login(request):
    handler = OAuthHandler()
    return handler.oauth_login(request)

def oauth_callback(request):
    handler = OAuthHandler()
    return handler.oauth_callback(request)