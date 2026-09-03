from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.enrollment.kpi_enrollment_yoy import enrollment_growth_yoy
@api_view(["GET"])
def enrollment_growth_yoy_kpi(request):
    # Get query params
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")

    # Convert to int if provided, else None
    try:
        country_id = int(country_id) if country_id else None
    except ValueError:
        country_id = None

    try:
        year = int(year) if year else None
    except ValueError:
        year = None

    # Call service with proper numeric types
    result = enrollment_growth_yoy(country_id=country_id, year=year)

    return Response({
        "yoy_growth": result
    })
