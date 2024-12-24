from django.urls import path
from .views import oauth_login, oauth_callback, UserInfoView, DisabilityRatingView, EligibleLettersView, PatientHealthView, ChatPromptView

urlpatterns = [
    path('auth/login/', oauth_login, name='oauth-login'),
    path('auth/callback/', oauth_callback, name='oauth-callback'),
    path('auth/user-info/', UserInfoView.as_view(), name='get_user_info'),
    path('auth/disability-rating/', DisabilityRatingView.as_view(), name='disability-rating'),
    path('auth/eligible-letters/', EligibleLettersView.as_view(), name='eligible-letters'),
    path('auth/patient-health/', PatientHealthView.as_view(), name='patient-health'),
    path('auth/prompt/<str:file_name>/', ChatPromptView.as_view(), name='get_prompt'),
    path('auth/prompt/', ChatPromptView.as_view(), name='post_prompt'),
    
]
