from django.urls import path
from .views import oauth_login, oauth_callback, UserInfoView

urlpatterns = [
    path('auth/login/', oauth_login, name='oauth-login'),
    path('auth/callback/', oauth_callback, name='oauth-callback'),
    path('auth/user-info/', UserInfoView.as_view(), name='get_user_info'),
]
