from rest_framework.permissions import BasePermission

class IsWebOrMobileClient(BasePermission):
    """
    Custom permission to allow mobile and web clients to access the API differently.
    """
    def has_permission(self, request, view):
        # Allow web clients using session-based authentication
        if not request.is_mobile:
            return request.user and request.user.is_authenticated

        # Allow mobile clients using token-based authentication
        if request.is_mobile:
            return bool(request.auth)

        return False
