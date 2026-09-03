from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.enrollment.graduation_rate_by_gender import graduation_rate_by_gender

@api_view(["GET"])
def graduation_rate_by_gender_kpi(request):
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")

    # Convert query params to int if provided
    try:
        country_id = int(country_id) if country_id else None
    except ValueError:
        country_id = None

    try:
        year = int(year) if year else None
    except ValueError:
        year = None

    result = graduation_rate_by_gender(country_id=country_id, year=year)

    return Response({
        "graduation_rate_by_gender": result
    })
