from django.middleware.csrf import CsrfViewMiddleware
from functools import wraps

def csrf_exempt_if_mobile(view):
    """
    Exempt CSRF for mobile clients while enforcing it for web clients.
    """
    @wraps(view)
    def wrapped_view(request, *args, **kwargs):
        # Check if the request is from a mobile client
        if getattr(request, 'is_mobile', False):
            # If mobile, bypass CSRF checks
            return view(request, *args, **kwargs)

        # Otherwise, enforce CSRF checks for web clients
        csrf_response = CsrfViewMiddleware().process_view(request, None, None, None)
        if csrf_response is not None:
            return csrf_response
        return view(request, *args, **kwargs)

    return wrapped_view
