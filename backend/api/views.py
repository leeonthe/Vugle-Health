from django.shortcuts import render
from urllib.parse import urlencode
from django.conf import settings
import requests
import base64

# OAuth settings (replace with your own)
CLIENT_ID = settings.VA_CLIENT_ID
CLIENT_SECRET = settings.VA_CLIENT_SECRET
AUTHORIZATION_URL = settings.VA_AUTHORIZATION_URL
TOKEN_URL = settings.VA_TOKEN_URL
REDIRECT_URI = settings.VA_REDIRECT_URI

print(CLIENT_ID)

def oauth_login(request):
    # Generate state and nonce values securely
    state = "your-generated-state"
    nonce = "your-generated-nonce"
    
    params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': REDIRECT_URI,
        'scope': 'profile openid offline_access disability_rating.read service_history.read veteran_status.read',
        'state': state,
        'nonce': nonce,
    }
    return redirect(f"{AUTHORIZATION_URL}?{urlencode(params)}")

def oauth_callback(request):
    code = request.GET.get('code')
    state = request.GET.get('state')
    if not code or not state:
        return redirect('/error')  # Handle errors gracefully

    # Token exchange
    token_response = requests.post(
        TOKEN_URL,
        data={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': REDIRECT_URI,
        },
        headers={
            'Authorization': f"Basic {base64.b64encode(f'{CLIENT_ID}:{CLIENT_SECRET}'.encode()).decode()}",
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    )

    if token_response.status_code != 200:
        return redirect('/error')  # Handle token exchange failure

    token_data = token_response.json()
    request.session['access_token'] = token_data.get('access_token')
    request.session['refresh_token'] = token_data.get('refresh_token')

    # Redirect to the frontend on success
    return redirect('http://localhost:8081/home')
