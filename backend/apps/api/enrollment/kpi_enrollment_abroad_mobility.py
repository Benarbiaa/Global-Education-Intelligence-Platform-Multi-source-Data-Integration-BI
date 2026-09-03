from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.enrollment.enrollment_abroad_mobility import enrollment_abroad_mobility

@api_view(["GET"])
def enrollment_abroad_mobility_kpi(request):
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")

    # Convert query params to numeric values if provided
    try:
        country_id = int(country_id) if country_id else None
    except ValueError:
        country_id = None

    try:
        year = int(year) if year else None
    except ValueError:
        year = None

    result = enrollment_abroad_mobility(country_id=country_id, year=year)

    return Response({
        "outbound_mobility_ratio": result
    })
