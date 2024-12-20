from django.shortcuts import redirect
from urllib.parse import urlencode
from django.http import JsonResponse
from django.conf import settings
from decouple import config
from jwt.exceptions import InvalidTokenError

from django.views import View
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session


import requests
import base64
import os
import random
import string
import hashlib
import jwt

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
        oauth_url = f"{self.authorization_url}?{urlencode(params)}"

        print(f"Generated OAuth Request URL: {oauth_url}")  # Print the OAuth URL
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
        access_token = token_data.get('access_token')

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

            print("Decoded ID Token Payload:", payload)

            
            # Extract name components
            full_name = payload.get("name", "")
            given_name, family_name = (full_name.split(" ", 1) + [None])[:2]  # Split into first and last names

            # Validate the nonce
            if payload.get('nonce') != saved_nonce:
                print("Nonce validation failed.")
                return redirect('/error')

            # Store user info in session
            request.session['user_info'] = {
                "given_name": given_name,
                "family_name": family_name,
            }

            print("User info stored in session:", request.session['user_info'])


        except InvalidTokenError as e:
            print(f"Token validation error: {e}")
            return redirect('/error')
        
        if platform == 'web':
        # Redirect web users directly
            print("WEB CALLED")
            return redirect('http://localhost:8081/Welcome')
        else:
            # For mobile apps, return JSON response
            # For now, return the url instead. 
            print("APP CALLED") 
            return redirect(f'http://localhost:8081/Welcome?access_token={access_token}&id_token={id_token}')

            # return redirect('http://localhost:8081/Welcome')

            # return JsonResponse(response_data)
       


def oauth_login(request):
    handler = OAuthHandler()
    return handler.oauth_login(request)

def oauth_callback(request):
    handler = OAuthHandler()
    return handler.oauth_callback(request)

 # Exempt CSRF for mobile clients
@method_decorator(csrf_exempt, name='dispatch') 
class UserInfoView(View):
    """
    API endpoint to fetch authenticated user's profile info for both web and mobile views.
    """
    def get(self, request, *args, **kwargs):
        """
        Handle GET requests to retrieve user information for both web and mobile clients.
        """
        # Check for token in the Authorization header (mobile clients)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            user_info = self.validate_access_token(token)
            if user_info:
                print("Extracted User Info for Mobile:", user_info)
                return JsonResponse({"user_info": user_info})
            else:
                return JsonResponse({"error": "Invalid or expired token"}, status=401)

        # For web clients, check session data
        user_info = request.session.get("user_info")
        if not user_info:
            return JsonResponse({"error": "User not authenticated"}, status=401)


        return JsonResponse({"user_info": user_info})

    def validate_access_token(self, token):
        """Validate the access token or ID token and extract user info."""
        keys_url = config('VA_KEYS_URL')

        try:
            # Fetch the signing key
            jwk_client = jwt.PyJWKClient(keys_url)
            signing_key = jwk_client.get_signing_key_from_jwt(token)

            # Decode token to inspect claims
            unverified_payload = jwt.decode(token, options={"verify_signature": False})
            print("Unverified Token Payload:", unverified_payload)
            expected_audience = unverified_payload.get("aud")
            
            # Validate the token
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=expected_audience,  
            )
            print("Decoded ID Token Payload:", payload)

            # Extract user information
            name = payload.get("name", "")  
            given_name = payload.get("given_name") or (name.split(" ")[0] if name else None)
            family_name = payload.get("family_name") or (
                name.split(" ")[1] if len(name.split(" ")) > 1 else None
            )

            # user info dictionary
            user_info = {
                "given_name": given_name,
                "family_name": family_name,
            }
            print("Extracted User Info:", user_info)

            return user_info
        except (InvalidTokenError, Exception) as e:
            print(f"Token validation error: {e}")
            return None

