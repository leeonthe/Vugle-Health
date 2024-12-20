from django.shortcuts import redirect
from urllib.parse import urlencode
from django.http import JsonResponse
from django.conf import settings
from decouple import config
import requests
import base64
import os
import random
import string
import hashlib
import jwt
from jwt.exceptions import InvalidTokenError

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

    def generate_nonce(self):
        """Generate a cryptographically secure nonce."""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

    def get_signing_key(self, token):
        """Fetch the signing key from the VA keys endpoint."""
        keys_url = config('VA_KEYS_URL')
        try:
            jwk_client = jwt.PyJWKClient(keys_url)
            signing_key = jwk_client.get_signing_key_from_jwt(token)
            return signing_key.key
        except Exception as e:
            print(f"Error fetching signing key: {e}")
            return None

    def oauth_login(self, request):
        """Redirect to VA.gov authorization URL."""
        # state = self.generate_state()
        # state = str(uuid.uuid4())
        platform = request.GET.get('platform', 'web')
        nonce = self.generate_nonce()
        state = f"{self.generate_state()}|{platform}"

        # Store to session 
        request.session['oauth_state'] = state.split('|')[0]
        request.session['oauth_nonce'] = nonce
        request.session['platform'] = platform
        request.session.save()


        print("PLATFORM STORED IN SESSION:", platform)
        print("SESSION DATA AFTER LOGIN:", request.session.items())
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'profile openid offline_access disability_rating.read service_history.read veteran_status.read',
            'state': state,
            'nonce': nonce,
        }
        print("OAUTH URL: ")
        return redirect(f"{self.authorization_url}?{urlencode(params)}")

    def oauth_callback(self, request):
        print("INCOMING COOKIES:", request.COOKIES)
        """Handle the callback and exchange the code for tokens."""
        code = request.GET.get('code')
        state = request.GET.get('state', '')

        state_parts = state.split('|')
        platform = state_parts[1] if len(state_parts) > 1 else None

        print("PLATFORM RETRIEVED FROM SESSION:", platform)
        print("SESSION DATA DURING CALLBACK:", request.session.items())
        print("PLATFORM IS ", platform)

        saved_state = request.session.get('oauth_state')
        saved_nonce = request.session.get('oauth_nonce')

        # if not code or not state or state != saved_state:
        #     return redirect('/error')

        # Validate state
        if not code or not state or state_parts[0] != saved_state:
            print("State validation failed.")
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
            print("Failed to fetch tokens.")
            return redirect('/error')

        token_data = token_response.json()
        id_token = token_data.get('id_token')

        # Validate the ID token
        try:
            signing_key = self.get_signing_key(id_token)
            if not signing_key:
                print("Signing key fetch failed.")
                return redirect('/error')

            payload = jwt.decode(
                id_token,
                signing_key,
                algorithms=["RS256"],
                audience=self.client_id,
                options={"require": ["exp", "nonce"]},
            )

            # Validate the nonce
            if payload.get('nonce') != saved_nonce:
                print("Nonce validation failed.")
                return redirect('/error')

            # Store user info in session
            request.session['user_info'] = {
                "given_name": payload.get("given_name"),
                "family_name": payload.get("family_name"),
                "email": payload.get("email"),
            }

            print("User info stored in session:", request.session['user_info'])


        except InvalidTokenError as e:
            print(f"Token validation error: {e}")
            return redirect('/error')

        # request.session['access_token'] = token_data.get('access_token')
        # request.session['refresh_token'] = token_data.get('refresh_token')


        # response_data = {
        #     'success': True,
        #     'redirect_url': '/success',  # Or '/postAuth/WelcomePage'
        # }
        
        if platform == 'web':
        # Redirect web users directly
            print("WEB CALLED")
            return redirect('http://localhost:8081/Welcome')
        else:
            # For mobile apps, return JSON response
            # For now, return the url instead. 
            print("APP CALLED") 
            return redirect('http://localhost:8081/Welcome')

            # return JsonResponse(response_data)
       


def oauth_login(request):
    handler = OAuthHandler()
    return handler.oauth_login(request)

def oauth_callback(request):
    handler = OAuthHandler()
    return handler.oauth_callback(request)