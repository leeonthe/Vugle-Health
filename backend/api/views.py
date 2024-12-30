from django.shortcuts import redirect
from urllib.parse import urlencode
from django.http import JsonResponse
from django.conf import settings
from decouple import config
from jwt.exceptions import InvalidTokenError

from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.middleware.csrf import get_token

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from base64 import b64encode

from .parsingPDF import parse_dd214_text
from .dex_analysis import generate_potential_conditions
from .dex_analysis import generate_most_suitable_claim_type
from .dex_analysis import test_generate_most_suitable_claim_type

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

def get_csrf_token(request):
    """Endpoint to expose CSRF token to the frontend."""
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

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

        # Clear session to prevent stale data
        print("CLEARING SESSION.. ")
        # request.session.flush()  # Clears all session data and regenerates the session ID
        for key in list(request.session.keys()):
            del request.session[key]
        request.session.save()
        print("ALL SESSION Data after clearing specific keys:", dict(request.session.items()))

        platform = request.GET.get('platform', 'web')
        nonce = self.generate_nonce()
        state = f"{self.generate_state()}|{platform}"

        # Store to session 
        request.session['oauth_state'] = state.split('|')[0]
        request.session['oauth_nonce'] = nonce
        request.session['platform'] = platform
        request.session.save()



        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'profile openid offline_access disability_rating.read service_history.read veteran_status.read',
            'state': state,
            'nonce': nonce,
        }
        oauth_url = f"{self.authorization_url}?{urlencode(params)}"
        print("Session data stored after oauth_login:", dict(request.session.items()))

        return redirect(f"{self.authorization_url}?{urlencode(params)}")

    def oauth_callback(self, request):
        print("Session data in callback:", dict(request.session.items()))

        """Handle the callback and exchange the code for tokens."""
        code = request.GET.get('code')
        state = request.GET.get('state', '')
        print("CODE IN CALLBACK", code)
        print("STATE IN CALLBACK", state)


        state_parts = state.split('|')
        platform = state_parts[1] if len(state_parts) > 1 else None

        saved_state = request.session.get('oauth_state')
        saved_nonce = request.session.get('oauth_nonce')
        print("SAVED_STATE", saved_state)
        print("SAVED_NONCE", saved_nonce)


        print("Stored session data: ", dict(request.session.items()))

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
        saved_accesstk = request.session.get("access_token")
        print("AFTER ACCESS TOKEN SAVED IN SESSION: ", saved_accesstk)
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
            expected_audience = unverified_payload.get("aud")
            
            # Validate the token
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=expected_audience,  
            )

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
            print("DISABILITY RATING WEB VIEW ACCESS TOKEN CALLED")
            access_token = auth_header.split(" ")[1]
        else:
            # Check session for web clients
            # print("DISABILITY RATING WEB VIEW ACCESS TOKEN CALLED")
            access_token = request.session.get("access_token")

        if not access_token:
            return JsonResponse({"error": "Access token missing or invalid."}, status=401)

        api_url = config('VA_DISABILITY_RATING_API_URL')
        headers = {
            "Authorization": f"Bearer {access_token}",
            "accept": "application/json"
        }

        try:
            response = requests.get(api_url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                extracted_data = {
                    "combined_disability_rating": data.get("data", {}).get("attributes", {}).get("combined_disability_rating", None),
                    "individual_ratings": [
                        {
                            "condition": rating.get("diagnostic_type_name", None),
                            "rating": rating.get("rating_percentage", None),
                            "effective_date": rating.get("effective_date", None),
                            "service_connection": rating.get("decision") == "Service Connected" if rating.get("decision") else None,
                            "static_condition": rating.get("static_ind", None)
                        }
                        for rating in data.get("data", {}).get("attributes", {}).get("individual_ratings", [])
                    ] if data.get("data", {}).get("attributes", {}).get("individual_ratings") else None
                }

                print("Extracted disability rating data: ", extracted_data)
                request.session["disability_rating_data"] = extracted_data
                return JsonResponse({"disability_rating": data})
            else:
                return JsonResponse({"error": "Failed to fetch disability rating.", "details": response.text}, status=response.status_code)

        except requests.RequestException as e:
            return JsonResponse({"error": "An error occurred while fetching disability rating.", "details": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class EligibleLettersView(View):
    ELIGIBLE_LETTER_TOKEN_URL = config('ELA_ELIGIBLE_LETTER_TOKEN_URL')
    ELA_AUDIENCE_URL = config('ELA_AUDIENCE_URL')
    LETTERS_URL = config('VA_ELIGIBLE_LETTER_API_URL')

    def get(self, request):
        ELA_icn = request.GET.get("icn", None)
        if not ELA_icn:
            return JsonResponse({"error": "ICN is required"}, status=400)

        try:
            # Step 1: Generate JWT client assertion
            jwt_token = self._ela_generate_jwt()
            
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
                extracted_data = {
                    "service_information": [
                        {
                            "branch": service.get("branch", None),
                            "character_of_service": service.get("characterOfService", None),
                            "service_period": {
                                "entered_date": service.get("enteredDateTime", None),
                                "released_date": service.get("releasedDateTime", None),
                            }
                        }
                        for service in data.get("militaryServices", [])
                    ] if data.get("militaryServices") else None,
                    "benefits": {
                        "monthly_award": data.get("benefitInformation", {}).get("monthlyAwardAmount", {}).get("value", None),
                        "service_connected_disabilities": data.get("benefitInformation", {}).get("serviceConnectedDisabilities", None),
                        "chapter_35_eligibility": data.get("benefitInformation", {}).get("chapter35Eligibility", None),
                    } if data.get("benefitInformation") else None
                }


                print("Extracted eligible letter data: ", extracted_data)
                request.session["eligible_letter_data"] = extracted_data
                print("ELIGIBLE LETTER DATA", data)
                return JsonResponse(data, status=200)
            else:
                return JsonResponse({"error": "Failed to fetch eligible letters", "details": response.text}, status=response.status_code)

        except Exception as e:
            return JsonResponse({"error": "Server error", "details": str(e)}, status=500)

    def _ela_generate_jwt(self):
        private_key_path = config("ELA_PRIVATE_KEY_PATH")
        client_id = config("ELA_JWT_CLIENT_ID")
        audience = self.ELA_AUDIENCE_URL

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

            response = requests.get(f"{self.PATIENT_HEALTH_API_URL}Condition?patient={PHA_icn}", headers=headers)

            if response.status_code == 200:
                data = response.json()
                # print("FULL PATIENT DATA: ", data)
                extracted_data = {
                    "device_requests": [
                        {
                            "type": entry["resource"].get("code", {}).get("text", None),  # Extract main condition name
                            "reason": entry["resource"].get("category", [{}])[0].get("text", None),  # Extract category text
                            "status": entry["resource"].get("clinicalStatus", {}).get("text", None),  # Extract clinical status
                            "last_updated": entry["resource"]["meta"].get("lastUpdated", None)  # Extract last updated date
                        }
                        for entry in data.get("entry", [])[:10]  # Limit to the first 10 entries
                    ]
                }
                print("Extracted patient health data: ", extracted_data)
                request.session["patient_health_data"] = extracted_data
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

            if not next_file:
                if current_file == "suitable_claim_type":
                    print("CALLING DexAnalysisResponse.generate_most_suitable_claim_response(request) [ChatPromptView]")
                    return DexAnalysisResponse.generate_most_suitable_claim_response(request)
                return Response({"error": "No next file specified and no dynamic handler available."}, status=status.HTTP_400_BAD_REQUEST)

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


# Store parsed dd214 in session
@method_decorator(csrf_exempt, name='dispatch')
class ParsingDD214(APIView):
    def post(self, request):
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]
                print(f"Access Token Received: {access_token}")
            else:
                access_token = request.session.get("access_token")
                print(f"Session Access Token: {access_token}")
            # Save uploaded file temporarily
            print("FILES:", request.FILES)
            # uploaded_file = request.FILES["file"]
            uploaded_file = request.FILES.get("file")

            if not uploaded_file:
                return JsonResponse({"error": "No file uploaded."}, status=400)

            allowed_file_types = ["application/pdf", "image/jpeg", "image/png"]
            if uploaded_file.content_type not in allowed_file_types:
                return JsonResponse({"error": "Unsupported file type."}, status=400)


            file_path = default_storage.save(uploaded_file.name, ContentFile(uploaded_file.read()))
            
            # Call the parsing function
            parsed_data = parse_dd214_text(file_path, processor_name="document_ocr")
            print("Parsed PDF:", parsed_data)
            processed_data = {
                "branch_of_service": parsed_data.get("Department, Component, and Branch", "NONE"),
                "grade_or_rank": parsed_data.get("Grade, Rate, or Rank", "NONE"),
                "pay_grade": parsed_data.get("Pay Grade", "NONE"),
                "active_duty_service_period": {
                    "date_entered": parsed_data.get("Date Entered Active Duty", "NONE"),
                    "date_separated": parsed_data.get("Separation Date", "NONE")
                },
                "net_active_service": parsed_data.get("Net Active Service", "NONE"),
                "total_foreign_service": parsed_data.get("Total Foreign Service", "NONE"),
                "decorations_and_awards": parsed_data.get("Decorations, Medals, and Awards", "NONE"),
                "remarks": parsed_data.get("Remarks", "NONE"),
            }
            
            # Save parsed data in session
            request.session["parsed_dd214_data"] = processed_data
           
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
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]
                print(f"AUTH HEADER HERE, IN STOREUSERINPUTVIEW: Access Token Received: {access_token}")
            else:
                access_token = request.session.get("access_token")
                print(f"AUTH HEADER NOT HERE, IN STOREUSERINPUTVIEW: Session Access Token: {access_token}")

            if not access_token:
                return JsonResponse({'success': False, 'message': 'Access token missing or invalid.'}, status=401)

            data = request.POST or json.loads(request.body)

            typed_text = data.get('userInput')
            input_type = data.get('inputType', '').strip() # to handle handleConditionType & hanldePainDuration by determining inputType which is provided it in .json file

            if not typed_text:
                return JsonResponse({'success': False, 'message': 'No input provided'}, status=400)

            # For new_condition.json
            if input_type == "conditionType":
                if 'user_medical_condition_response' not in request.session:
                    request.session['user_medical_condition_response'] = []
                if not isinstance(request.session['user_medical_condition_response'], list):
                    request.session['user_medical_condition_response'] = []

                request.session['user_medical_condition_response'].append(typed_text.strip())
                request.session.modified = True
                # print(f"Session ID during POST: {request.session.session_key}")
                # print(f"Session data after saving: {dict(request.session.items())}")
                print(f"user_medical_condition_response in session: {request.session.get('user_medical_condition_response')}")
                return JsonResponse({'success': True, 'message': 'Condition input stored successfully'})

            # For pain_duration.json
            elif input_type == "painDuration":
                request.session['user_pain_duration'] = typed_text
                request.session.modified = True
                print(f"Pain duration input stored: {typed_text}")
                return JsonResponse({'success': True, 'message': 'Pain duration input stored successfully'})

            # for pain_severity.json
            elif input_type == "painSeverity":
                request.session['user_pain_severity'] = typed_text
                request.session.modified = True
                print(f"user_pain_severity in session: {request.session.get('user_medical_condition_response')}")
                return JsonResponse({'success': True, 'message': 'Pain severity input stored successfully'})
            
            # Add other behavior if added / existed
            # For now, this is default
            else:
                request.session['userTypedText'] = typed_text
                request.session.modified = True
                print(f"User input stored in session: {typed_text}")
                return JsonResponse({'success': True, 'message': 'Input stored successfully'})
            print(f"Session data during POST: {request.session.items()}")

        except Exception as e:
            print(f"Error storing user input: {e}")
            return JsonResponse({'success': False, 'message': 'An error occurred'}, status=500)

# Store potential conditions in session
@method_decorator(csrf_exempt, name='dispatch')
class StorePotentialConditions(View):
    def post(self, request):
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]
                print(f"Access Token Received [StorePotentialConditions]: {access_token}")
            else:
                access_token = request.session.get("access_token")
                print(f"Session Access Token [StorePotentialConditions]: {access_token}")

            body = json.loads(request.body)
            conditions = body.get('conditions', [])

            if not isinstance(conditions, list):
                return JsonResponse({'error': 'Invalid data format. "conditions" should be a list.'}, status=400)

            # Ensure there's a session for the user
            if 'potential_conditions' not in request.session:
                request.session['potential_conditions'] = []

            # Store the conditions in the session
            request.session['potential_conditions'].extend(conditions)
            request.session.modified = True
            TEST_POT = request.session.get('potential_conditions')
            print("STORED potential_conditions in session: ", TEST_POT)
            return JsonResponse({'message': 'Conditions stored successfully.', 'stored_conditions': request.session['potential_conditions']}, status=200)
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class DexAnalysisResponse():
    @staticmethod
    @csrf_exempt
    def get_potential_conditions(request): 
    # This is for PotentialConditionsPage
        if request.method == "GET":
            user_input = request.session.get('user_medical_condition_response', None)
            print("USER INPUT FROM request.session.get('user_medical_condition_response', None): ", user_input)
            if not user_input:
                print("NO user_medical_condition_response IN SESSION", user_input)
                return JsonResponse({"error": "No user input found in session"}, status=400)

            conditions = generate_potential_conditions(user_input)
            parsed_conditions = []
            
            for condition in conditions:
                try:
                    lines = condition.split('\n')
                    condition_name = lines[0].split(":")[1].strip()
                    risk_level = lines[1].split(":")[1].strip()
                    description = lines[2].split(":")[1].strip()

                    # Assign risk color based on risk level
                    risk_color = (
                        "red" if risk_level == "High risk" else
                        "orange" if risk_level == "Medium risk" else
                        "green"
                    )

                    parsed_conditions.append({
                        "name": condition_name,
                        "risk": risk_level,
                        "riskColor": risk_color,
                        "description": description,
                    })
                except IndexError:
                    continue

            return JsonResponse({"conditions": parsed_conditions}, status=200)

        return JsonResponse({"error": "Invalid request method"}, status=405)

    @staticmethod
    @csrf_exempt
    def generate_most_suitable_claim_response(request):
        try:
            print("Generating GPT response for suitable claim type...")
            gpt_response = generate_most_suitable_claim_type(request)
            # gpt_response = test_generate_most_suitable_claim_type()
            print("GPT Response:", gpt_response)

            # Validate GPT response
            if not gpt_response or "Type of claim:" not in gpt_response or "Description:" not in gpt_response:
                return JsonResponse({"error": "Invalid GPT response format"}, status=500)

            # Split GPT response into lines
            lines = gpt_response.split('\n')
            print("Parsed GPT response lines:", lines)

            claim_type = None
            description = None

            for line in lines:
                stripped_line = line.strip()  # Remove leading and trailing spaces
                if stripped_line.startswith("Type of claim:"):
                    claim_type = stripped_line.split(":", 1)[1].strip()
                elif stripped_line.startswith("Description:"):
                    description = stripped_line.split(":", 1)[1].strip()

            if not claim_type or not description:
                print("Invalid GPT response format:", lines)
                return JsonResponse({"error": "Invalid GPT response: Missing 'Type of claim' or 'Description'."}, status=500)


            # Format GPT response into the chat bubble structure
            data = {
                "chat_bubbles_id": 10,
                "options_id": 10,
                "chat_bubbles": [
                    {
                        "container": [
                            {
                                "type": "image",
                                "content": "app_logo",
                                "style": {
                                    "width": 24,
                                    "height": 24
                                }
                            }
                        ]
                    },
                    {
                        "container": [
                            {
                                "type": "text",
                                "content": claim_type,
                                "style": {
                                    "color": "#323D4C",
                                    "fontSize": 16,
                                    "fontFamily": "SF Pro",
                                    "fontWeight": "bold",
                                    "lineHeight": 28,
                                    "wordWrap": "break-word",
                                    "marginBottom": 16
                                },
                            },
                            {
                                "type": "text",
                                "content": description,
                                "style": {
                                    "color": "#323D4C",
                                    "fontSize": 16,
                                    "fontFamily": "SF Pro",
                                    "fontWeight": "400",
                                    "lineHeight": 28,
                                    "wordWrap": "break-word",
                                    "marginBottom": 16
                                },
                            },
                            {
                                "type": "link",
                                "content": "What is this claim?",
                                "url": "https://example.com/more-info",
                                "style": {
                                    "color": "#3182F6",
                                    "textDecorationLine": "underline",
                                    "marginBottom": 0
                                }
                            }
                        ]
                    },
                ],
                "options": [
                    {
                        "text": "Start Filing",
                        "next": "has_been_clinics"
                    }
                ]
            }

            print("JSON structured in DexAnalysisResponse, generate_most_suitable_claim_response: ",data)

            return JsonResponse(data, status=200)

        except KeyError as ke:
            return JsonResponse(
                {"error": f"Missing key in GPT response: {str(ke)}"},
                status=500
            )
        except Exception as e:
            return JsonResponse(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=500
            )