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

def generate_most_suitable_claim_type():
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
    prompt = f"""
    Based on the following veteran's data:

    1. **Disability Rating Data**:
    - Combined Disability Rating: {request.session.get('disability_rating_data', {}).get('combined_disability_rating')}
    - Individual Ratings:
        {[
            f"""
            Condition: {rating.get('condition')}
            Rating: {rating.get('rating')}%
            Effective Date: {rating.get('effective_date')}
            Service Connection: {'Yes' if rating.get('service_connection') else 'No'}
            Static Condition: {'Yes' if rating.get('static_condition') else 'No'}
            """
            for rating in request.session.get('disability_rating_data', {}).get('individual_ratings', [])
        ]}
    
    2. **Eligible Letter Data**:
    - Service Information:
        {[
            f"""
            Branch: {service.get('branch')}
            Character of Service: {service.get('character_of_service')}
            Service Period: From {service.get('service_period', {}).get('entered_date')} to {service.get('service_period', {}).get('released_date')}
            """
            for service in request.session.get('eligible_letter_data', {}).get('service_information', [])
        ]}
    - Benefits:
        Monthly Award: ${request.session.get('eligible_letter_data', {}).get('benefits', {}).get('monthly_award')}
        Service-Connected Disabilities: {'Yes' if request.session.get('eligible_letter_data', {}).get('benefits', {}).get('service_connected_disabilities') else 'No'}
        Chapter 35 Eligibility: {'Yes' if request.session.get('eligible_letter_data', {}).get('benefits', {}).get('chapter_35_eligibility') else 'No'}

    3. **Patient Health Data**:
    - Device Requests:
        {[
            f"""
            Type: {request.get('type', 'NONE')}
            Reason: {request.get('reason', 'NONE')}
            Status: {request.get('status', 'NONE')}
            Last Updated: {request.get('last_updated', 'NONE')}
            """
            for request in request.session.get('patient_health_data', {}).get('device_requests', [])
        ]}
    
    4. **Additional Service Details from DD214**:
    - Net Active Service: {request.session.get('parsed_dd214_data', {}).get('net_active_service', 'NONE')}
    - Total Foreign Service: {request.session.get('parsed_dd214_data', {}).get('total_foreign_service', 'NONE')}
    - Decorations, Medals, and Awards: {request.session.get('parsed_dd214_data', {}).get('decorations_and_awards', 'NONE')}
    - Remarks: {request.session.get('parsed_dd214_data', {}).get('remarks', 'NONE')}


    5. **User-Reported Medical Details**:
    - Medical Conditions: {', '.join(request.session.get('user_medical_condition_response', []))}
    - Pain Duration: {request.session.get('user_pain_duration', 'NONE')}
    - Pain Severity: {request.session.get('user_pain_severity', 'NONE')}

    Determine the most suitable type of VA claim for this veteran based on the options below:
        1. **New Claim**: A claim for a new sevice-connected condition not previously submitted to or recognized by the VA, i.e. if there is an existing disability rating, it should not be because of this new condition.
        2. **Increased Claim**: A claim indicating that an existing service-connected condition has worsened.
        3. **Secondary Service-Connected Claim**: A claim for a new condition that is caused or aggravated by an existing service-connected disability, or other health conditions found in the user's medical history: {medical_record}.        
    
    Your response must be provided in the following format:

    Type of claim: <Name of claim>
    Description: <One ~ two sentence description why this type of claim is best suited for this user given user input and data>

    Ensure seperate Type of claim and Description with a blank line. Provide a concise description that fits within the token limit of 500. 
    """
    return query_gpt(prompt, context_type="generate_most_suitable_claim_type")

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
