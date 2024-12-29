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

def query_gpt(prompt):
    """
    Query the ChatGPT API with a given prompt and return the response.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", 
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
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
    potential_conditions = query_gpt(prompt)
    return potential_conditions.split('\n\n')

def generate_most_suitable_claim_type(stored_user_data):
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
        - disability_rating_data
        - eligible_letter_data
        - patient_health_data
        - parsed_dd214_data
        - user_medical_condition_response
        - user_pain_duration
        - user_pain_severity
        - potential_conditions

    Determine the most suitable type of VA claim for this veteran. Consider the following options:
        1. **New Claim**: A claim for a new sevice-connected condition not previously submitted to or recognized by the VA, i.e. if there is an existing disability rating, it should not be because of this new condition.
        2. **Increased Claim**: A claim indicating that an existing service-connected condition has worsened.
        3. **Secondary Service-Connected Claim**: A claim for a new condition that is caused or aggravated by an existing service-connected disability, or other health conditions found in the user's medical history: {medical_record}.        
    
    Your response must be provided in the following format:
    Type of claim: <Name of claim>
    Description: <One ~ two sentence description why this type of claim is best suited for this user given user input and data>
    """
    suitable_claim_type_response = query_gpt(prompt)

def test_generate_most_suitable_claim_type():
    testResponse = 
    """
    Type of claim: New Claim
    Description: THiS IS FOR TESTING PURPOSE 
    """

    return testResponse
if __name__ == "__main__":
    user_input = "I have trouble in sleeping."
    conditions = generate_potential_conditions(user_input)
    print(conditions)
