# Vugle-Health

## Overview
Vugle-Health is an AI-integrated application designed to provide personalized financial assistance and healthcare benefit support to active duty U.S. military personnel and veterans. By leveraging AI technology, Vugle-Health educates veterans on their entitlements, simplifies the benefits application process, and expedites claim submissions, ensuring veterans receive the financial and health benefits they deserve.

## Problem Statement 
Veterans in the U.S. face significant barriers when accessing their benefits: 
- **Cumbersome Application Processes**: Filing disability claims requires extensive documentation and is often delayed by administrative inefficiencies. In 2023 alone, over 1.9 million claims were submitted, with a backlog of 300,000.
- **Lack of Awareness**: Many veterans are unaware of their eligibility for various benefits. Reports show that 51% of veterans have never used their entitlements post-discharge. 
- **Limited Support Infrastructure**: Veteran Service Organizations (VSOs) and other support systems are stretched thin, leading to long wait times and insufficient assistance. 

## Mission 
Vugle aims to streamline financial assistance for American active duty military personnel. We achieve this by simplifying the benefits claim process and referring them to other benefits. 

Our vision is to ensure that no veteran is left behind. That every veteran receives the full benefits they deserve.

## Features
Vugle-Health offers a robust suite of tools designed to assist veterans in navigating the benefits process with ease and efficiency:
1. **Secure Login**
- Vugle-Health integrates OAuth and OpenID Connect authentication through the official VA.gov site, ensuring a highly secure and reliable login experience for veterans. This implementation leverages the Authorization Code Grant flow for enhanced security.

2. **AI Chabot: Dex**  
- Dex is Vugle’s main feature—an AI-powered chatbot designed to simplify the disability claim process and educate veterans. Dex analyzes veterans' medical records and collects their current medical conditions to identify potential medical conditions and most suitable claim types. It offers personalized assistance, making the claims process faster and more intuitive.

3. **Streamlined Application Process**  
- Vugle-Health automates the retrieval and organization of critical data to enhance the accuracy and efficiency of disability claims. It fetches relevant information through OAuth authentication and parses veterans' DD214 forms (military service documentation) to identify the most suitable claim type and maximize their compensation rating.

4. **Web & Mobile Compatibility**
 - The platform detects the user’s device type and dynamically adjusts the interface for optimal usability. Vugle-Health provides a seamless mobile experience, ensuring veterans can easily manage their disability claims from their phones. The mobile UI is designed to provide the same comprehensive functionality as the web version, while maintaining a user-friendly experience tailored to smaller screens.

## Technical Details

### Tech Stack
- **Backend:** Django (Python)
- **Frontend:** React Native Expo (TypeScript)


### System Architecture
The system is designed with a **cohesive yet decoupled architecture** for scalability, maintainability, and a clear separation of concerns.

#### Backend
- Built with **Django** and **Django REST Framework (DRF)** to provide RESTful APIs.
- **OAuth2 and OpenID Connect Integration**: Secure login implemented through VA.gov using the Authorization Code Grant flow.
- **Document Parsing**: Processes DD214 forms using `Google Cloud's Document AI` to extract relevant data for claims analysis.

#### Frontend
- Developed with **React Native Expo** for cross-platform development.


## Getting Started


After you click “VA Continue with VA.gov”, you will see below page:
<p>
  <img src="README_IMG/README_Auth_login.png" alt="Authentication Login" width="400">
</p>
<p align="center"><em>Figure 1: Authentication Login Page</em></p>


You may use below information to begin the application. 

### Logging in with ID.me (Recommended)
To log in to the sandbox environment using ID.me:
1. Enter the ID.me email from the Test User table.
   - The password for all ID.me test accounts is: **SandboxPassword2024!**
2. When asked about receiving an authentication code, don't change any preselected answers. Just click **Continue** to proceed to the next step.

### Logging in with Login.gov
To log in to the sandbox environment using Login.gov:
1. Enter the Login.gov email from the Test User table.
   - The password for all Login.gov test accounts is: **Password12345!!!**
2. Use the Login.gov MFA seed to generate a 2FA code with an app such as Google Authenticator or Authy.

### Test User Table

| First Name | Last Name | ID.me                                      | Login.gov                                                        |
|------------|-----------|-------------------------------------------|------------------------------------------------------------------|
| Tamara     | Ellis     | Email: va.api.user+001-2024@gmail.com      | Email: va.api.user+001@gmail.com <br> 2-Factor Seed: LKI7FZ7ZEVRLGQRW |
| Janet      | Moore     | Email: va.api.user+002-2024@gmail.com      | Email: va.api.user+002@gmail.com <br> 2-Factor Seed: B5C3L42PLUWO3U5T |
| Ralph      | Lee       | Email: va.api.user+003-2024@gmail.com      | Email: va.api.user+003@gmail.com <br> 2-Factor Seed: DIN72VD3MUOWJEENIS2FTJZEAROTGBAC |
| Sheba703   | Harris789 | Email: va.api.user+101-2024@gmail.com      | Email: va.api.user+101@gmail.com <br> 2-Factor Seed: BNBV63ON5ST7BHSU |








