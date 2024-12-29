from django.urls import path
from .views import (
    oauth_login,
    oauth_callback,
    get_csrf_token,
    UserInfoView,
    DisabilityRatingView,
    EligibleLettersView,
    PatientHealthView,
    ChatPromptView,
    ParsingDD214,
    StoreUserInputView,
    StorePotentialConditions,
    DexAnalysisResponse,
)

urlpatterns = [
    path('csrf/', get_csrf_token, name='get_csrf_token'),
    path('auth/login/', oauth_login, name='oauth-login'),
    path('auth/callback/', oauth_callback, name='oauth-callback'),
    path('auth/user-info/', UserInfoView.as_view(), name='get_user_info'),
    path('auth/disability-rating/', DisabilityRatingView.as_view(), name='disability-rating'),
    path('auth/eligible-letters/', EligibleLettersView.as_view(), name='eligible-letters'),
    path('auth/patient-health/', PatientHealthView.as_view(), name='patient-health'),
    path('auth/prompt/<str:file_name>/', ChatPromptView.as_view(), name='get_prompt'),
    path('auth/prompt/', ChatPromptView.as_view(), name='chat_prompt_post'),
    path('auth/upload_dd214/', ParsingDD214.as_view(), name='upload_dd214'),
    path('auth/store_user_input', StoreUserInputView.as_view(), name='store_user_input'),
    path('auth/potential_conditions/', StorePotentialConditions.as_view(), name='store_potential_conditions'),
    path('auth/potential_conditions_list/', DexAnalysisResponse.get_potential_conditions, name='get_potential_conditions_list'),
    path('auth/suitable_claim_type/', DexAnalysisResponse.generate_most_suitable_claim_response, name='get_most_suitable_claim_response'),

]
