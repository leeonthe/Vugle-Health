import yaml
from openai import OpenAI
from decouple import config

gpt_api_key_path = config("GPT_API_KEY")

def get_gpt_api_key():
    """
    Load the GPT API key from the specified YAML file.
    """
    try:
        with open(gpt_api_key_path, "r") as file:
            config = yaml.safe_load(file)
            return config["gpt_api_key"]
    except FileNotFoundError:
        raise FileNotFoundError(f"YAML file not found at path: {gpt_api_key_path}")
    except KeyError:
        raise KeyError("gpt_api_key not found in the YAML file")
    except Exception as e:
        raise Exception(f"Error loading API key: {e}")

client = OpenAI(api_key=get_gpt_api_key())

def query_gpt(prompt, context_type="general"):
    """
    Query the ChatGPT API with a given prompt and return the response.
    context_type can be:
        - "generate_potential_conditions" for generating related conditions.
        - "generate_most_suitable_claim_type" for determining the most suitable VA claim type.
        - "general" (default) for a generic helpful assistant role.
    """
    try:
        # Set system role message based on context
        if context_type == "generate_potential_conditions":
            system_message = "You are an expert in medical conditions and can analyze user inputs to suggest related health conditions."
        elif context_type == "generate_most_suitable_claim_type":
            system_message = "You are an expert in VA disability claims and can analyze user data to recommend the most suitable claim type."
        else:
            system_message = "You are a helpful assistant."

        # Query GPT with the given prompt
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.4
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error querying GPT: {e}")
        return ""

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
    potential_conditions = query_gpt(prompt, context_type="generate_potential_conditions")
    return potential_conditions.split('\n\n')

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

    prompt = f"""
    Based on the following veteran's data:

    1. **Disability Rating Data**:
    - Combined Disability Rating: {disability_rating_data.get('combined_disability_rating')}
    - Individual Ratings:
        {[
            f"Condition: {rating.get('condition')}, Rating: {rating.get('rating')}%, Effective Date: {rating.get('effective_date')}, "
            f"Service Connection: {'Yes' if rating.get('service_connection') else 'No'}, "
            f"Static Condition: {'Yes' if rating.get('static_condition') else 'No'}"
            for rating in disability_rating_data.get('individual_ratings', [])
        ]}

    2. **Eligible Letter Data**:
    - Service Information:
        {[
            f"Branch: {service.get('branch')}, Character of Service: {service.get('character_of_service')}, "
            f"Service Period: From {service.get('service_period', {}).get('entered_date')} to {service.get('service_period', {}).get('released_date')}"
            for service in eligible_letter_data.get('service_information', [])
        ]}
    - Benefits:
        Monthly Award: ${eligible_letter_data.get('benefits', {}).get('monthly_award')}
        Service-Connected Disabilities: {'Yes' if eligible_letter_data.get('benefits', {}).get('service_connected_disabilities') else 'No'}
        Chapter 35 Eligibility: {'Yes' if eligible_letter_data.get('benefits', {}).get('chapter_35_eligibility') else 'No'}

    3. **Patient Health Data**:
    - Device Requests:
        {[
            f"Type: {device.get('type', 'NONE')}, Reason: {device.get('reason', 'NONE')}, Status: {device.get('status', 'NONE')}, "
            f"Last Updated: {device.get('last_updated', 'NONE')}"
            for device in patient_health_data.get('device_requests', [])
        ]}

    4. **Additional Service Details from DD214**:
    - Net Active Service: {parsed_dd214_data.get('net_active_service', 'NONE')}
    - Total Foreign Service: {parsed_dd214_data.get('total_foreign_service', 'NONE')}
    - Decorations, Medals, and Awards: {parsed_dd214_data.get('decorations_and_awards', 'NONE')}
    - Remarks: {parsed_dd214_data.get('remarks', 'NONE')}

    5. **User-Reported Medical Details**:
    - Medical Conditions: {', '.join(user_medical_condition_response)}
    - Pain Duration: {user_pain_duration}
    - Pain Severity: {user_pain_severity}

    Using the information above, determine the most suitable VA claim type for this veteran. Follow these **guidelines**:

    ### Guidelines:
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

    **Response Format**:
    - Type of claim: <Name of claim>
    - Description: <One ~ two sentence description explaining why this claim is best suited for this user given user input and data. Provide a concise description that fits within the token limit of 500.>


    Provide your response in this **Response Format** with **no additional information**. 
    """

    response = query_gpt(prompt, context_type="generate_most_suitable_claim_type")
    print("GPT RESPONSE READY: ", response)
    return response

def test_generate_most_suitable_claim_type():
    
    testResponse = f"""
    Type of claim: New Claim
    Description: THiS IS FOR TESTING PURPOSE 
    """

    return testResponse

if __name__ == "__main__":
    user_input = "I have trouble in sleeping."
    conditions = test_generate_most_suitable_claim_type()
    print(conditions)
