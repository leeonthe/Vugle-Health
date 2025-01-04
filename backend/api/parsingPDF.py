import yaml
import os
import re
import boto3
from google.cloud import documentai_v1beta3 as documentai
from decouple import config 
from botocore.exceptions import ClientError

def get_secret(secret_name, region_name="us-east-2"):
    """
    Fetch a specific secret value from AWS Secrets Manager.

    Args:
        secret_name (str): The name of the secret in Secrets Manager.
        region_name (str): The AWS region where the secret is stored.

    Returns:
        str or dict: The secret value, either as a JSON string or plain text.
    """
    client = boto3.client(service_name="secretsmanager", region_name=region_name)
    try:
        response = client.get_secret_value(SecretId=secret_name)
        if "SecretString" in response:
            return json.loads(response["SecretString"])
        elif "SecretBinary" in response:
            return json.loads(response["SecretBinary"].decode("utf-8"))
        return None
    except ClientError as e:
        print(f"Error retrieving secret {secret_name}: {e}")
        raise e

def load_processor_config(yaml_content):
    """
    Load processor information from a YAML string.

    Args:
        yaml_content (str): YAML content as a string.

    Returns:
        dict: Parsed processor configuration.
    """
    try:
        return yaml.safe_load(yaml_content)
    except yaml.YAMLError as e:
        print(f"Error loading YAML content: {e}")
        raise e



def analyze_document(file_path, processor_name):
    """
    Processes a document using Google Cloud Document AI.

    Args:
        file_path (str): Path to the file to process.
        processor_name (str): Name of the processor to use (e.g., "document_ocr").

    Returns:
        str: Extracted text from the document.
    """
    try:
        gcp_credentials = get_secret("GOOGLE_APPLICATION_CREDENTIALS")
        processor_config_content = get_secret("PROCESSOR_INFO")
        processor_config = load_processor_config(processor_config_content)

        # config
        # processor_config = load_processor_config(processor_info_path)
        project_id = processor_config["gcp_project_id"]
        location = processor_config["gcp_location"]
        processor = processor_config["processors"].get(processor_name)

        if not processor:
            raise ValueError(f"Processor '{processor_name}' not found in configuration.")

        processor_id = processor["processor_id"]

        print(f"Processing file: {file_path} using processor: {processor['name']}")

        # Determine MIME type based on file extension
        if file_path.lower().endswith(".pdf"):
            mime_type = "application/pdf"
        elif file_path.lower().endswith(".jpg") or file_path.lower().endswith(".jpeg"):
            mime_type = "image/jpeg"
        elif file_path.lower().endswith(".png"):
            mime_type = "image/png"
        else:
            raise ValueError("Unsupported file format")

        print(f"Detected MIME type: {mime_type}")

        client = documentai.DocumentProcessorServiceClient.from_service_account_json(gcp_credentials)

        with open(file_path, "rb") as f:
            document_content = f.read()

        document = {"content": document_content, "mime_type": mime_type}
        processor_name = f"projects/{project_id}/locations/{location}/processors/{processor_id}"
        request = documentai.ProcessRequest(name=processor_name, raw_document=document)

        # Process the document
        result = client.process_document(request=request)
        document = result.document

        print("Document processed successfully.")
        return document.text

    except Exception as e:
        print(f"Error in analyze_document: {e}")
        raise


# TESTING
# def parse_dd214_text(extracted_text):

def parse_dd214_text(file_path, processor_name):
    """
    Parses the extracted text of DD214 to retrieve specific sections and store them in a structured format.

    Args:
        extracted_text (str): The full text extracted from the DD214 document.

    Returns:
        dict: Parsed data for the required fields.
    """

    extracted_text = analyze_document(file_path, processor_name)

    parsed_data = {
        "Department, Component, and Branch": "Not Found",
        "Grade, Rate, or Rank": "Not Found",
        "Pay Grade": "Not Found",
        "Date Entered Active Duty": "Not Found",
        "Separation Date": "Not Found",
        "Net Active Service": "Not Found",
        "Total Foreign Service": "Not Found",
        "Primary Specialty": "Not Found",
        "Decorations, Medals, and Awards": "Not Found",
        "Military Education": "Not Found",
        "Remarks": "Not Found",
        "SGLI Coverage": "Not Found",
    }

    try:
        # Department, Component, and Branch (Section 2)
        if match := re.search(r"2\.\s+DEPARTMENT, COMPONENT AND BRANCH\s*(.+)", extracted_text, re.IGNORECASE):
            parsed_data["Department, Component, and Branch"] = match.group(1).strip()

        # Grade, Rate, or Rank (Section 4a)
        if match := re.search(r"4a\.\s+GRADE, RATE OR RANK\s*(.+)", extracted_text, re.IGNORECASE):
            parsed_data["Grade, Rate, or Rank"] = match.group(1).strip()

        # Pay Grade (Section 4b)
        if match := re.search(r"b\.\s+PAY GRADE\s*(.+)", extracted_text, re.IGNORECASE):
            parsed_data["Pay Grade"] = match.group(1).strip()

        # Primary Specialty (Section 11)
        if match := re.search(
            r"11\.\s+PRIMARY SPECIALTY\s*\(.*?\)\s*([\s\S]+?)(?=\n\s*\d+\.)",
            extracted_text,
            re.IGNORECASE
        ):
            parsed_data["Primary Specialty"] = match.group(1).strip()

       # Date Entered Active Duty (Section 12a - Located under YEAR(S), MONTH(S), DAY(S))
        if match := re.search(
            r"YEAR\(S\).*?(\d{4}).*?DAY\(S\).*?(\w+).*?(\d{2})",
            extracted_text,
            re.IGNORECASE | re.DOTALL
        ):
            parsed_data["Date Entered Active Duty"] = f"{match.group(1)} {match.group(2)} {match.group(3)}"

        # Separation Date (Section 12b - Located right after DAY(S) for Date Entered Active Duty)
        if match := re.search(
            r"DAY\(S\).*?\d{2}.*?(\d{4}).*?(\w+).*?(\d{2})",
            extracted_text,
            re.IGNORECASE | re.DOTALL
        ):
            parsed_data["Separation Date"] = f"{match.group(1)} {match.group(2)} {match.group(3)}"

        # Net Active Service (Section 12c)
        if match := re.search(r"12\.\s+RECORD OF SERVICE.*?NET ACTIVE SERVICE THIS PERIOD.*?\n\s*(\d{2})\s+(\d{2})\s+(\d{2})", extracted_text, re.IGNORECASE | re.DOTALL):
            parsed_data["Net Active Service"] = f"{match.group(1)} {match.group(2)} {match.group(3)}"

        # Total Foreign Service (Section 12f)
        if match := re.search(r"12\.\s+RECORD OF SERVICE.*?FOREIGN SERVICE.*?\n\s*(\d{2})\s+(\d{2})\s+(\d{2})", extracted_text, re.IGNORECASE | re.DOTALL):
            parsed_data["Total Foreign Service"] = f"{match.group(1)} {match.group(2)} {match.group(3)}"

        # Decorations, Medals, and Awards (Section 13)
        if match := re.search(r"13\.\s+DECORATIONS, MEDALS, BADGES, CITATIONS.*?\n\s*(.+?)(?:14\.|//SEE REMARKS//)", extracted_text, re.DOTALL | re.IGNORECASE):
            parsed_data["Decorations, Medals, and Awards"] = match.group(1).strip()

        # Military Education (Section 14)
        if match := re.search(r"14\.\s+MILITARY EDUCATION.*?\n\s*(.+?)(?:15\.|//SEE REMARKS//)", extracted_text, re.DOTALL | re.IGNORECASE):
            parsed_data["Military Education"] = match.group(1).strip()

        # Remarks (Section 18)
        if match := re.search(r"18\.\s+REMARKS.*?\n\s*(.+?)(?:19a\.|$)", extracted_text, re.DOTALL | re.IGNORECASE):
            parsed_data["Remarks"] = match.group(1).strip()

        # SGLI Coverage (Section 10)
        if match := re.search(r"10\.\s+SGLI COVERAGE\s+AMOUNT:\s*\$(\d{1,3}(?:,\d{3})*)", extracted_text, re.IGNORECASE):
            parsed_data["SGLI Coverage"] = match.group(1).strip()

    except Exception as e:
        print(f"An error occurred while parsing: {e}")

    return parsed_data


# TESTING 
# if __name__ == "__main__":
#     extracted_text = """
#     CAUTION: NOT TO BE USED FOR
#     IDENTIFICATION PURPOSES
#     1. NAME (Last, First, Middle)
#     THIS IS AN IMPORTANT RECORD.
#     SAFEGUARD IT.
#     ANY ALTERATIONS IN SHADED AREAS
#     RENDER FORM VOID
#     CERTIFICATE OF RELEASE OR DISCHARGE FROM ACTIVE DUTY
#     This Report Contains Information Subject to the Privacy Act of 1974, As Amended.
#     2. DEPARTMENT, COMPONENT AND BRANCH
#     AIR FORCE--REGAF
#     3. SOCIAL SECURITY NUMBER
#     4a. GRADE, RATE OR RANK
#     CAPT
#     b. PAY GRADE
#     03
#     5. DATE OF BIRTH (YYYYMMDD)
#     6. RESERVE OBLIGATION TERMINATION DATE
#     (YYYYMMDD) 20150529
#     b. HOME OF RECORD AT TIME OF ENTRY (City and state, or complete address if known)
#     7a. PLACE OF ENTRY INTO ACTIVE DUTY
#     COLORADO SPRINGS CO
#     8a. LAST DUTY ASSIGNMENT AND MAJOR COMMAND
#     OL PZA AF LIFE CYCLE MGT CE (MTC)
#     9. COMMAND TO WHICH TRANSFERRED
#     USAFR
#     11. PRIMARY SPECIALTY (List number, title and years and months inspecialty. List additional specialty numbers and titles involving
#     periods of one or more years.)
#     64P3, CONTRACTING, 5 YEARS AND 4 MONTHS
#     b. STATION WHERE SEPARATED
#     JBSA RANDOLPH AFB TX
#     12. RECORD OF SERVICE
#     a. DATE ENTERED AD THIS PERIOD
#     b. SEPARATION DATE THIS PERIOD
#     10. SGLI COVERAGE
#     AMOUNT: $400,000
#     YEAR(S) MONTHS(S)
#     2007
#     NONE
#     DAY(S)
#     MAY
#     30
#     2012
#     OCT
#     26
#     c. NET ACTIVE SERVICE THIS PERIOD
#     d. TOTAL PRIOR ACTIVE SERVICE
#     05
#     04
#     27
#     00
#     00
#     00
#     e. TOTAL PRIOR INACTIVE SERVICE
#     03
#     11
#     04
#     f. FOREIGN SERVICE
#     00
#     06
#     19
#     g. SEA SERVICE
#     00
#     00
#     00
#     h. INITIAL ENTRY TRAINING
#     2007
#     MAY
#     30
#     i. EFFECTIVE DATE OF PAY GRADE
#     2011
#     MAY
#     30
#     13. DECORATIONS, MEDALS, BADGES, CITATIONS AND CAMPAIGN
#     RIBBONS AWARDED OR AUTHORIZED (All periods of service)
#     Defense Meritorious Service Medal, Air Force Commendation Medal with
#     1 oak leaf cluster, Air Force Achievement Medal with 1 oak leaf cluster,
#     Joint Meritorious Unit Award, AF Outstanding Unit Award, AF
#     Organizational Excellence Award with 1 oak leaf cluster, National
#     Defense Service Medal, Afghanistan Campaign Medal,//SEE REMARKS//
#     14. MILITARY EDUCATION (Course title, number of weeks, and month and
#     year completed)
#     PDÉ - SQUADRON OFFICER SCHOOL (SOS), MAY 2012; (JHE)
#     SHAPING SMART BUSINESS ARRANGEMENTS, JUL 2011; (J01)
#     FUNDAMENTALS OF SYSTEMS PLANNING RD&E, JUN 2011; (3NH)
#     COMBAT AIRMAN SKILLS TRAINING, MAY 2011; (JHS) COST ANALYSIS
#     AND NEGOTIATION TECHNIQUES, MAR 2010; (JHR) LEGAL
#     CONSIDERATIONS IN CONTRACTING, AUG 2009; //SEE REMARKS//
#     15a. COMMISSIONED THROUGH SERVICE ACADEMY
#     b. COMMISSIONED THROUGH ROTC SCHOLARSHIP (10 USC Sec. 2107b)
#     c. ENLISTED UNDER LOAN REPAYMENT PROGRAM (10 USC Chap. 109) (If yes, years of commitment:
#     16. DAYS ACCRUED LEAVE
#     YES
#     NO
#     YES
#     NO
#     )
#     YES
#     NO
#     PAID
#     0
#     17. MEMBER WAS PROVIDED COMPLETE DENTAL EXAMINATION AND ALL APPROPRIATE
#     DENTAL SERVICES AND TREATMENT WITHIN 90 DAYS PRIOR TO SEPARATION
#     YES
#     NO
#     18. REMARKS
#     ITEM 13: Global War on Terrorism Service Medal, Air Force Expeditionary Service Ribbon with Gold Border, AF Longevity Service with 1 oak leaf
#     cluster, AF Training Ribbon, NATO Medal (Wear first NATO medal awarded.). ITEM 14: (055) INTERMEDIATE SYSTEMS ACQUISITION, JUL 2009;
#     (JHP) BUSINESS DECISIONS FOR CONTRACTING, JUN 2009; (9A8) FUNDAMENTALS OF SYSTEMS ACQUISITION MGMT, JAN 2009; (07G)
#     THE SMALL BUSINESS PROGRAM - WEB, AUG 2008; BDE-AIR AND SPACE BASIC COURSE (ASBC), DEC 2007; (CWI) SIMPLIFIED
#     ACQUISITION PROCEDURES (SAP), OCT 2007; (BO1) MISSION SUPPORT PLANNING, OCT 2007; (GYO) MISSION FOCUSED CONTRACTING,
#     SEP 2007; (JHN) MISSION FOCUSED CONTRACTING COURSE, SEP 2007; (OLC) MISSION READY CONTRACTING OFFICER COURSE, SEP
#     2007. Member has completed first full term of service. Attended //See Continuation Page//
#     The information contained herein is subject to computer matching within the Department of Defense or with any other affected Federal or non-Federal agency for verification purposes and
#     to determine eligibility for, and/or continued compliance with, the requirements of a Federal benefit program.
#     19a. MAILING ADDRESS AFTER SEPARATION (Include ZIP Code)
#     b. NEAREST RELATIVE (Name and address - include ZIP Code)
#     b. DATE
#     (YYYYMMDD)
#     N/A
#     20. MEMBER REQUESTS COPY 6 BE SENT TO (Specify state/locality)
#     MA
#     OFFICE OF VETERANS AFFAIRS
#     a. MEMBER REQUESTS COPY 3 BE SENT TO THE CENTRAL OFFICE OF THE DEPARTMENT OF VETERANS AFFAIRS
#     (WASHINGTON, DC)
#     21.a. MEMBER SIGNATURE
#     MEMBER NOT AVAILABLE TO SIGN
#     YES
#     NO
#     YES
#     ☑ NO
#     22.a. OFFICIAL AUTHORIZED TO SIGN (Typed name, grade, title, signature)
#     CAC/PKI SIGNED BY
#     b. DATE
#     (YYYYMMDD)
#     20121026
#     DD FORM 214, AUG 2009
#     CONTRACTOR, USAF, Separation Documantation Technician Oct 26 2012
#     2:58:26:000PM
#     CAC Serial Number: 18173E IssuerCN: DOD CA-26
#     PREVIOUS EDITION IS OBSOLETE
#     MEMBER-1
#     """

#     # Parse the extracted text
#     parsed_dd214 = parse_dd214_text(extracted_text)

#     # Print the parsed data
#     print("Parsed Data:")
#     for key, value in parsed_dd214.items():
#         print(f"{key}: {value}")