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

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from base64 import b64encode
from .parsingPDF import parse_dd214_text


import requests
import base64
import os
import random
import string
import hashlib
import jwt
import json
import time
import uuid
import traceback

# 
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


        # print("PLATFORM STORED IN SESSION:", platform)
        # print("SESSION DATA AFTER LOGIN:", request.session.items())
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

        # print("PLATFORM RETRIEVED FROM SESSION:", platform)
        # print("SESSION DATA DURING CALLBACK:", request.session.items())
        # print("PLATFORM IS ", platform)

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
        # TODO: Store access_token in session if needed -> This is for disability_rating fetching.
        request.session['access_token'] = access_token
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
            # return redirect('http://localhost:8081/Welcome')
            return redirect(f'http://localhost:8081/Welcome?access_token={access_token}&id_token={id_token}')

        else:
            print("APP CALLED") 
            return redirect(f'http://localhost:8081/Welcome?access_token={access_token}&id_token={id_token}')
       


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


@method_decorator(csrf_exempt, name='dispatch')
class DisabilityRatingView(View):
    """
    API endpoint to fetch a Veteran's disability rating.
    Handles both web and mobile clients.
    """

    def get(self, request, *args, **kwargs):
        # Check for token in Authorization header (mobile clients)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            access_token = auth_header.split(" ")[1]
        else:
            # Check session for web clients
            access_token = request.session.get("access_token")

        if not access_token:
            return JsonResponse({"error": "Access token missing or invalid."}, status=401)

        # api_url = "https://sandbox-api.va.gov/services/veteran_verification/v2/disability_rating"
        api_url = config('VA_DISABILITY_RATING_API_URL')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "accept": "application/json"
        }

        try:
            response = requests.get(api_url, headers=headers)

            if response.status_code == 200:
                data = response.json()
                print("DISABILITY RATING DATA: ", data)
                return JsonResponse({"disability_rating": data})
            else:
                return JsonResponse({"error": "Failed to fetch disability rating.", "details": response.text}, status=response.status_code)

        except requests.RequestException as e:
            return JsonResponse({"error": "An error occurred while fetching disability rating.", "details": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class EligibleLettersView(View):
    # Sandbox token URL
    ELIGIBLE_LETTER_TOKEN_URL = config('ELA_ELIGIBLE_LETTER_TOKEN_URL')
    ELA_AUDIENCE_URL = config('ELA_AUDIENCE_URL')
    LETTERS_URL = config('VA_ELIGIBLE_LETTER_API_URL')

    print("ELIGIBLE_LETTER_TOKEN_URL IS ", ELIGIBLE_LETTER_TOKEN_URL)
    print("ELA_AUDIENCE_URL IS ", ELA_AUDIENCE_URL)
    def get(self, request):
        ELA_icn = request.GET.get("icn", None)
        if not ELA_icn:
            return JsonResponse({"error": "ICN is required"}, status=400)

        try:
            print("TRY CALLED: ")
            # Step 1: Generate JWT client assertion
            jwt_token = self._ela_generate_jwt()
            print("GENERATED JWT TOKEN FROM _ela_generate_jwt: ", jwt_token)
            # Step 2: Retrieve access token
            access_token = self._get_ela_access_token(jwt_token)
            if not access_token:
                return JsonResponse({"error": "Failed to retrieve access token"}, status=401)

            # Step 3: Fetch eligible letters
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            }
            response = requests.get(f"{self.LETTERS_URL}?icn={ELA_icn}", headers=headers)

            if response.status_code == 200:
                data = response.json()
                print("ELIGIBLE LETTER DATA", data)
                return JsonResponse(data, status=200)
            else:
                return JsonResponse({"error": "Failed to fetch eligible letters", "details": response.text}, status=response.status_code)

        except Exception as e:
            return JsonResponse({"error": "Server error", "details": str(e)}, status=500)

            # return JsonResponse({"error": str(e)}, status=500)

    def _ela_generate_jwt(self):
        private_key_path = config("ELA_PRIVATE_KEY_PATH")
        print("PRIVATE.PEM: ", private_key_path)
        # private_key_path = Path(__file__).resolve().parent.parent.parent / 'private.pem'
        client_id = config("ELA_JWT_CLIENT_ID")
        audience = self.ELA_AUDIENCE_URL
        print("AUDIENCE: ", audience)
        # Load the private key
        with open(private_key_path, 'r') as key_file:
            private_key = key_file.read()

        iat = int(time.time())
        exp = iat + 300

        # JWT claims
        claims = {
            "aud": audience,
            "iss": client_id,
            "sub": client_id,
            "iat": iat,
            "exp": exp,  # Token expires in 5 minutes
            "jti": str(uuid.uuid4()),
        }

        # Generate and sign the JWT
        signed_jwt = jwt.encode(claims, private_key, algorithm="RS256")
        print("Generated JWT: ", signed_jwt)

        # TODO: Decode jwt token?
        return signed_jwt

    def _get_ela_access_token(self, jwt_token):
        # Data for the token request
        payload = {
            "grant_type": "client_credentials",
            "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            "client_assertion": jwt_token,
            "scope": "letters.read",
        }

        # Headers for the token request
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        # Make the POST request to get the access token
        response = requests.post(self.ELIGIBLE_LETTER_TOKEN_URL, data=payload, headers=headers)

        if response.status_code == 200:
            token_data = response.json()
            return token_data.get("access_token")
        else:
            print("Access Token Response:", response.text)
            print("Access Token Error:", response.json())
            return None



@method_decorator(csrf_exempt, name='dispatch')
class PatientHealthView(View):
    PATIENT_HEALTH_TOKEN_URL = config('PHA_ELIGIBLE_LETTER_TOKEN_URL')
    PHA_AUDIENCE_URL = config('PHA_AUDIENCE_URL')
    PATIENT_HEALTH_API_URL = config('VA_PATIENT_HEALTH_API_URL')

    def get(self, request):
        PHA_icn = request.GET.get("patient", None)
        if not PHA_icn:
            return JsonResponse({"error": "ICN is required"}, status=400)

        try:
            jwt_token = self._pha_generate_jwt()
            access_token = self._get_pha_access_token(jwt_token, PHA_icn)
            if not access_token:
                return JsonResponse({"error": "Failed to retrieve access token"}, status=401)

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "accept: application/fhir+json",
            }
            response = requests.get(f"{self.PATIENT_HEALTH_API_URL}Patient?_id={PHA_icn}", headers=headers)

            if response.status_code == 200:
                data = response.json()
                print("PATIENT MEDICAL CONDITION DATA", data)
                return JsonResponse(data, status=200)
            else:
                return JsonResponse({"error": "Failed to fetch eligible letters", "details": response.text}, status=response.status_code)

        except Exception as e:
            return JsonResponse({"error": "Server error", "details": str(e)}, status=500)

    def _pha_generate_jwt(self):
        private_key_path = config("PHA_PRIVATE_KEY_PATH")
        if not os.path.exists(private_key_path):
            raise FileNotFoundError(f"Private key file not found at {private_key_path}")
        client_id = config("PHA_JWT_CLIENT_ID")
        audience = self.PHA_AUDIENCE_URL
        # Load the private key
        with open(private_key_path, 'r') as key_file:
            private_key = key_file.read()

        iat = int(time.time())
        exp = iat + 300

        # JWT claims
        claims = {
            "aud": audience,
            "iss": client_id,
            "sub": client_id,
            "iat": iat,
            "exp": exp,  # Token expires in 5 minutes
            "jti": str(uuid.uuid4()),
        }

        signed_jwt = jwt.encode(claims, private_key, algorithm="RS256")
        return signed_jwt

    def _get_pha_access_token(self, jwt_token, icn):
        # The launch parameter limits the scope of an access token by indicating that the token is for a specific patient or encounter.
        # launch must be a Base64-encoded JSON object containing the patient's ICN, formatted as follows: {"patient":"1000720100V271387"}
        # After Base64 encoding, the object will look like this: eyJwYXRpZW50IjoiMTAwMDcyMDEwMFYyNzEzODcifQ==
        launch_payload = json.dumps({"patient": icn})
        launch_encoded = b64encode(launch_payload.encode('utf-8')).decode('utf-8')
        payload = {
            "grant_type": "client_credentials",
            "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            "client_assertion": jwt_token,
            "scope": "launch system/AllergyIntolerance.read system/Appointment.read system/Condition.read system/DiagnosticReport.read system/Immunization.read system/Location.read system/Medication.read system/MedicationOrder.read system/Observation.read system/Organization.read system/Patient.read",
            "launch": launch_encoded,
        }

        headers = {
            "Accept": "application/fhir+json",
            "Content-Type": "application/x-www-form-urlencoded",
        }

        # Make the POST request to get the access token
        response = requests.post(self.PATIENT_HEALTH_TOKEN_URL, data=payload, headers=headers)

        if response.status_code == 200:
            token_data = response.json()
            return token_data.get("access_token")
        else:
            print("Access Token Response:", response.text)
            print("Access Token Error:", response.json())
            return None






PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "prompts")

@method_decorator(csrf_exempt, name='dispatch') 
class ChatPromptView(APIView):
    def get(self, request, file_name):
        """
        GET method to fetch a specific JSON prompt file.
        :param file_name: Path to the JSON file, including folder structure (e.g., "start/start").
        """
        try:
            folder_name = file_name
            nested_file_path = os.path.join(folder_name, file_name + ".json")
            file_path = os.path.join(PROMPTS_DIR, nested_file_path)

            print(f"Resolved file path: {file_path}")  # Debugging log

            if not os.path.exists(file_path):
                return Response({"error": f"File {file_name} not found in folder {folder_name}"}, status=status.HTTP_404_NOT_FOUND)
            
            # Load the JSON file
            with open(file_path, "r") as json_file:
                data = json.load(json_file)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def post(self, request):
        """
        POST method to process user selections and return the next prompt.
        """
        try:
            current_file = request.data.get("current_file")  # e.g., "start/start"
            next_file = request.data.get("user_selection")  # Now `user_selection` is the "next" value

            print("POST endpoint hit! URL:", request.build_absolute_uri())
            print("Current File:", current_file)
            print("Next File:", next_file)

            # Resolve the next file path
            nested_file_path = os.path.join(next_file, next_file + ".json")
            next_file_path = os.path.join(PROMPTS_DIR, nested_file_path)

            print("Resolved Next File Path:", next_file_path)
            
           
            if not os.path.exists(next_file_path):
                print("Next file not found!")
                return Response({"error": "Next file not found"}, status=status.HTTP_404_NOT_FOUND)

            # Load the next JSON file
            with open(next_file_path, "r") as next_json_file:
                next_data = json.load(next_json_file)

            next_data["next"] = next_file  # Include the next file name in the response

            return Response(next_data, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class ParsingDD214(APIView):
    def post(self, request):
        try:
            print("FILES:", request.FILES)
            # Save uploaded file temporarily
            uploaded_file = request.FILES["file"]
            file_path = default_storage.save(uploaded_file.name, ContentFile(uploaded_file.read()))
            
            # Call the parsing function
            parsed_data = parse_dd214_text(file_path, processor_name="document_ocr")
            print("Parsed PDF:", parsed_data)
            
            # Save parsed data in session
            request.session["parsed_dd214_data"] = parsed_data
           
            # Delete temporary file
            if os.path.exists(file_path):
                os.remove(file_path)

            return JsonResponse({"message": "File processed successfully", "data": parsed_data}, status=200)

        except Exception as e:
            print("Error in ParsingDD214:", str(e))
            print(traceback.format_exc()) 
            return JsonResponse({"error": str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class StoreUserInputView(View):
    def post(self, request):
        try:
            data = request.POST or json.loads(request.body)
            typed_text = data.get('userInput', '').strip()

            if not typed_text:
                return JsonResponse({'success': False, 'message': 'No input provided'}, status=400)

            # Save user typed text in session
            request.session['userTypedText'] = typed_text
            # TESTING
            print(f"User input stored in session: {typed_text}")

            return JsonResponse({'success': True, 'message': 'Input stored successfully'})
        except Exception as e:
            print(f"Error storing user input: {e}")
            return JsonResponse({'success': False, 'message': 'An error occurred'}, status=500)
