from django.utils.deprecation import MiddlewareMixin

class ClientDetectionMiddleware(MiddlewareMixin):
    def process_request(self, request):
        """Add a flag to the request object to determine if it's from a mobile or web client."""
        if "Authorization" in request.headers and request.headers["Authorization"].startswith("Bearer "):
            request.is_mobile = True
        else:
            request.is_mobile = False
