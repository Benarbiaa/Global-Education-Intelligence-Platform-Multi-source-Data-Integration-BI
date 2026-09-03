from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.enrollment.kpi_enrollment_yoy import enrollment_growth_yoy

@api_view(["GET"])
def enrollment_gross_ratio_kpi(request):
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")

    # Convert year to int if provided
    try:
        year = int(year) if year else None
    except (ValueError, TypeError):
        year = None

    result = enrollment_growth_yoy(country_id=country_id, year=year)
    return Response({
        "gross_enrollment_ratio": result
    })
