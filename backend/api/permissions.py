from rest_framework.permissions import BasePermission

class IsWebOrMobileClient(BasePermission):
    """
    Custom permission to allow mobile and web clients to access the API differently.
    """

    def has_permission(self, request, view):
        # Special handling for UserInfoView GET requests
        if view.__class__.__name__ == "UserInfoView" and request.method == "GET":
            if request.is_mobile:
                auth_header = request.headers.get("Authorization")
                if auth_header and auth_header.startswith("Bearer "):
                    return True  # Assume token validity is checked later in the view
            else:
                # Allow session-based authentication for web clients
                return request.user and request.user.is_authenticated

        # Default behavior for other views
        if request.is_mobile:
            return bool(request.auth)  # JWT-based authentication for mobile
        else:
            return request.user and request.user.is_authenticated  # Session-based for web
