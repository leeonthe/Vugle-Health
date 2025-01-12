import yaml
import boto3
import json

from openai import OpenAI
from decouple import config
from django.views.decorators.csrf import csrf_exempt
from botocore.exceptions import ClientError


def get_secret(secret_name):
    """
    Fetch a specific secret value from AWS Secrets Manager.

    Args:
        secret_name (str): The name of the secret in Secrets Manager.

    Returns:
        dict: The secret value as a dictionary (parsed from JSON).
    """
    region_name = "us-east-2"
    session = boto3.session.Session()
    client = session.client(service_name="secretsmanager", region_name=region_name)

    try:
        response = client.get_secret_value(SecretId=secret_name)
        if "SecretString" in response:
            return json.loads(response["SecretString"])  # Parse the SecretString into a dictionary
        elif "SecretBinary" in response:
            return json.loads(response["SecretBinary"].decode("utf-8"))
    except ClientError as e:
        raise Exception(f"Error retrieving secret {secret_name}: {e}")


def get_gpt_api_key():
    """
    Load the GPT API key from the `skrt/vugle-health/skrt` secret.
    
    Returns:
        str: The GPT API key.
    """
    try:
        secret_data = get_secret("skrt/vugle-health/skrt")
        if "GPT_API_KEY" in secret_data:
            gpt_api_key_data = json.loads(secret_data["GPT_API_KEY"])  # Parse JSON inside GPT_API_KEY
            if "gpt_api_key" in gpt_api_key_data:
                return gpt_api_key_data["gpt_api_key"]  # Extract the actual API key
            else:
                raise KeyError("gpt_api_key not found in GPT_API_KEY JSON content.")
        else:
            raise KeyError("GPT_API_KEY not found in the secret.")
    except Exception as e:
        print(f"Error loading GPT API key: {e}")
        raise


def get_openai_client():
    """
    Lazily initialize the OpenAI client.
    
    Returns:
        OpenAI: The OpenAI client instance.
    """
    api_key = get_gpt_api_key()
    return OpenAI(api_key=api_key)

def query_gpt(prompt, context_type="general"):
    """
    Query the ChatGPT API with a given prompt and return the response.
    context_type can be:
        - "generate_potential_conditions" for generating related conditions.
        - "generate_most_suitable_claim_type" for determining the most suitable VA claim type.
        - "general" (default) for a generic helpful assistant role.
    """
    client = get_openai_client()
    print("CLIENT CALLED")
    try:
        # Set system role message based on context
        if context_type == "generate_potential_conditions":
            system_message = "You are an expert in medical conditions and can analyze user inputs to suggest related health conditions."
            a_model="gpt-3.5-turbo"
            a_max_tokens = 300
        elif context_type == "generate_most_suitable_claim_type":
            system_message = "You are an expert in VA disability claims and can analyze user data to recommend the most suitable claim type."
            a_model="gpt-4"
            a_max_tokens = 700
        else:
            system_message = "You are a helpful assistant."
            a_model="gpt-3.5-turbo"
            a_max_tokens = 300


        # Query GPT with the given prompt
        response = client.chat.completions.create(
            model= a_model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            max_tokens=a_max_tokens,
            temperature=0.4
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error querying GPT: {e}")
        raise

def generate_potential_conditions(user_input):
    """
    Generate a list of related conditions based on user input.
    """

    prompt = f"""
    Generate a list of conditions related to the user's input: '{user_input}' in the following format:
    
    Condition Name: <name>
    Risk Level: <High/Medium/Low risk>
    Description: <short description (maximum 20 words)>
    
    Ensure the response includes a minimum of 4 lists of conditions, each with a concise description that fits within the token limit of 300.
    Separate each condition with a blank line.
    """
    print("generate_potential_conditions called")
    try:
        potential_conditions = query_gpt(prompt, context_type="generate_potential_conditions")
        print("GPT response in generate_potential_conditions:", potential_conditions)
        parsed_conditions = potential_conditions.split('\n\n')
        return parsed_conditions
    except Exception as e:
        print(f"Error parsing GPT response: {e}")
        raise
    # return potential_conditions.split('\n\n')

def generate_most_suitable_claim_type(request):
    """
    Generate the most suitable claim type based on stored user data:
        - disability_rating_data
        - eligible_letter_data
        - patient_health_data
        - parsed_dd214_data
        - user_medical_condition_response
        - user_pain_duration
        - user_pain_severity
        - potential_conditions
    """
    # Fetch required session data
    disability_rating_data = request.session.get('disability_rating_data', {})
    eligible_letter_data = request.session.get('eligible_letter_data', {})
    patient_health_data = request.session.get('patient_health_data', {})
    parsed_dd214_data = request.session.get('parsed_dd214_data', {})
    user_medical_condition_response = request.session.get('user_medical_condition_response', [])
    user_pain_duration = request.session.get('user_pain_duration', 'NONE')
    user_pain_severity = request.session.get('user_pain_severity', 'NONE')
    print("Session data for GPT prompt:")
    print(f"user_medical_condition_response: {user_medical_condition_response}")
    print(f"user_pain_duration: {user_pain_duration}")
    print(f"user_pain_severity: {user_pain_severity}") 
    prompt = f"""
    Based on the following veteran's data:

    1. **Disability Rating Data**:
    - Combined Disability Rating: {disability_rating_data.get('combined_disability_rating', 'N/A')}
    - Individual Ratings:
        {[
            f"Condition: {rating.get('condition', 'N/A')}, Rating: {rating.get('rating', 'N/A')}%, Effective Date: {rating.get('effective_date', 'N/A')}, "
            f"Service Connection: {'Yes' if rating.get('service_connection', False) else 'No'}, "
            f"Static Condition: {'Yes' if rating.get('static_condition', False) else 'No'}"
            for rating in disability_rating_data.get('individual_ratings', [])
        ] or 'No individual ratings available'}

    2. **Eligible Letter Data**:
    - Service Information:
        {[
            f"Branch: {service.get('branch', 'N/A')}, Character of Service: {service.get('character_of_service', 'N/A')}, "
            f"Service Period: From {service.get('service_period', {}).get('entered_date', 'N/A')} to {service.get('service_period', {}).get('released_date', 'N/A')}"
            for service in eligible_letter_data.get('service_information', [])
        ] or 'No service information available'}
    - Benefits:
        Monthly Award: ${eligible_letter_data.get('benefits', {}).get('monthly_award', 'N/A')}
        Service-Connected Disabilities: {'Yes' if eligible_letter_data.get('benefits', {}).get('service_connected_disabilities', False) else 'No'}
        Chapter 35 Eligibility: {'Yes' if eligible_letter_data.get('benefits', {}).get('chapter_35_eligibility', False) else 'No'}

    3. **Patient Health Data**:
    - Device Requests:
        {[
            f"Type: {device.get('type', 'N/A')}, Reason: {device.get('reason', 'N/A')}, Status: {device.get('status', 'N/A')}, "
            f"Last Updated: {device.get('last_updated', 'N/A')}"
            for device in patient_health_data.get('device_requests', [])
        ] or 'No device requests available'}

    4. **Additional Service Details from DD214**:
    - Net Active Service: {parsed_dd214_data.get('net_active_service', 'N/A')}
    - Total Foreign Service: {parsed_dd214_data.get('total_foreign_service', 'N/A')}
    - Decorations, Medals, and Awards: {parsed_dd214_data.get('decorations_and_awards', 'N/A')}
    - Remarks: {parsed_dd214_data.get('remarks', 'N/A')}

    5. **User-Reported Medical Details**:
    - Medical Conditions: {', '.join(user_medical_condition_response) or 'None provided'}
    - Pain Duration: {user_pain_duration}
    - Pain Severity: {user_pain_severity}

    Using the information above, determine the most suitable VA claim type for this veteran AND determine the Branch of Medicine & write an appointment message. Follow these **guidelines**:

    ### Guidelines for most suitable VA claim type:
    1. **New Claim**:
        - Use this if the veteran has reported a new condition that is not associated with any previously service-connected conditions or disability ratings.
        - Example Response:
        ```
        Type of claim: New Claim
        Description: The reported medical condition `{', '.join(user_medical_condition_response)}` is a newly identified issue and has no prior association with existing service-connected conditions. 
        ```

    2. **Increased Claim**:
        - Use this if the veteran has a service-connected condition with an existing disability rating and their reported condition or data suggests a worsening of that condition.
        - Example Response:
        ```
        Type of claim: Increased Claim
        Description: Your condition `{disability_rating_data.get('individual_ratings', [{}])[0].get('condition', 'N/A')}` appears to have worsened, requiring a reevaluation of your existing disability rating of `{disability_rating_data.get('individual_ratings', [{}])[0].get('rating', 'N/A')}%`.
        ```

    3. **Secondary Service-Connected Claim**:
        - Use this if the veteran's reported condition is likely caused or aggravated by an existing service-connected condition.
        - Example Response:
        ```
        Type of claim: Secondary Service-Connected Claim
        Description: Your condition `{user_medical_condition_response[0] if user_medical_condition_response else 'N/A'}` might be affected by your existing service-connected condition `{disability_rating_data.get('individual_ratings', [{}])[0].get('condition', 'N/A')}`, which has a disability rating of `{disability_rating_data.get('individual_ratings', [{}])[0].get('rating', 'N/A')}%`.
        ```
    ### Guidelines for Branch of Medicine & appointment message:
    1. **Determine the Branch of Medicine**:
        - Identify the appropriate branch of medicine based on the data from Medical Conditions in User-Reported Medical Details. (e.g., Orthopedics for knee pain, Neurology for headaches). Provide a single branch of medicine name without additional explanation.

    2. **Generate the Appointment Message**:
        - Write two concise sentences:
            - The first sentence should describe the user's medical condition based on Medical Conditions and Pain Duration in first person point of view. (e.g. I’m experiencing knee pain that has been troubling me for the past 3 months.)
            - The second sentence should explain the cause of the condition if it relates to the user's service history (e.g., "The pain started after I was injured by shrapnel during my deployment to Iraq."). If no service-related cause is evident, exclude the second sentence.



    ### Fallback Guidelines:
    - If session data for any section is missing, explicitly note "Data unavailable" in that section and proceed with available data.
    - If no data is available for **Eligible Letter Data**, **Disability Rating Data**, **Patient Health Data**, or **Additional Service Details from DD214**, prioritize the information provided in **User-Reported Medical Details** or any other available fields.
    - Provide a logical assumption based on the limited data for selecting the most suitable claim type.


    **Response Format**:
    Type of claim: <Name of claim>
    Description: <One ~ two sentence description explaining why this claim is best suited for this user given user input and data. Provide a concise description that fits within the token limit of 500.>
    Branch of Medicine: <Name of branch of medicine>
    Apppointment Message: <One ~ two sentences of appointment message from ### Guidelines for appointment message.>

    Provide your response in this **Response Format** with **no additional information**. 
    """

    response = query_gpt(prompt, context_type="generate_most_suitable_claim_type")
    print("GPT RESPONSE READY: ", response)
    return response

def test_generate_most_suitable_claim_type():
    
    testResponse = f"""
    Type of claim: New Claim
    Description: The veteran has not reported any service-connected disabilities, and there is no information on existing conditions. Therefore, a new claim is appropriate for any potential medical conditions that may not be associated with prior service-connected issues. 
    """

    return testResponse

if __name__ == "__main__":
    # user_input = "I have trouble in sleeping."
    # conditions = test_generate_most_suitable_claim_type()
    # print(conditions)
    # Test fetching GPT API key
    try:
        print("Testing: Fetching GPT API Key...")
        gpt_api_key = get_gpt_api_key()
        print(f"GPT API Key successfully retrieved: {gpt_api_key}")
    except Exception as e:
        print(f"Error retrieving GPT API Key: {e}")

    # Test fetching the entire secret
    try:
        print("\nTesting: Fetching entire secret 'skrt/vugle-health/skrt'...")
        secret_data = get_secret("skrt/vugle-health/skrt")
        print("Secret successfully retrieved:")
        print(secret_data)
    except Exception as e:
        print(f"Error retrieving the secret: {e}")

    # Test initializing the OpenAI client
    try:
        print("\nTesting: Initializing OpenAI client...")
        openai_client = get_openai_client()
        print("OpenAI client successfully initialized.")
        print(openai_client)
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")

