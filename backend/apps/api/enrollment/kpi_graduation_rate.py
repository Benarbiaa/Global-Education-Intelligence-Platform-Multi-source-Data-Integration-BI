from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.enrollment.graduation_rate import average_graduation_rate

@api_view(["GET"])
def average_graduation_rate_kpi(request):
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

    result = average_graduation_rate(country_id=country_id, year=year)

    return Response({
        "average_graduation_rate": result
    })
