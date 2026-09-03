from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def api_root(request):
    """API root endpoint with available services"""
    return JsonResponse({
        'status': 'success',
        'message': 'Education Data Warehouse API',
        'version': '1.0',
        'endpoints': {
            'research': '/api/warehouse/research/',
            'education': '/api/warehouse/education/',
            'enrollment': '/api/warehouse/enrollment/',
            'expenditure': '/api/warehouse/expenditure/',
        }
    })

@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'warehouse-api'
    })