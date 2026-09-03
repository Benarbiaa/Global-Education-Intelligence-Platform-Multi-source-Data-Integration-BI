"""
Shared utility functions for all KPI services
"""
from django.http import JsonResponse
from functools import wraps


def standard_response(data, kpi_name, count=None):
    """Standardize API responses"""
    response = {
        'status': 'success',
        'kpi': kpi_name,
        'data': data
    }
    if count is not None:
        response['count'] = count
    return response


def error_response(message, status_code=500):
    """Standardize error responses"""
    return JsonResponse({
        'status': 'error',
        'message': str(message)
    }, status=status_code)


def safe_divide(numerator, denominator, default=0):
    """Safe division avoiding divide by zero"""
    try:
        return round(numerator / denominator, 2) if denominator and denominator != 0 else default
    except (TypeError, ZeroDivisionError):
        return default


def handle_api_errors(view_func):
    """Decorator to handle common API errors"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)
        except ValueError as e:
            return error_response(f"Invalid parameter: {e}", 400)
        except Exception as e:
            return error_response(f"Internal server error: {e}", 500)
    return wrapper


def get_query_param(request, param_name, default=None, param_type=str):
    """Safely get and convert query parameters"""
    value = request.GET.get(param_name, default)
    if value is None or value == default:
        return default
    
    try:
        if param_type == int:
            return int(value)
        elif param_type == float:
            return float(value)
        elif param_type == bool:
            return value.lower() in ('true', '1', 'yes')
        return str(value)
    except (ValueError, AttributeError):
        return default