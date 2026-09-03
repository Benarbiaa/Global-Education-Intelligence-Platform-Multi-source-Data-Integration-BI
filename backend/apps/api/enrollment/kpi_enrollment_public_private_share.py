from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.enrollment.enrollment_public_private_share import enrollment_public_private_share

@api_view(["GET"])
def enrollment_public_private_kpi(request):
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")

    # Convert to int if provided
    try:
        country_id = int(country_id) if country_id else None
    except ValueError:
        country_id = None

    try:
        year = int(year) if year else None
    except ValueError:
        year = None

    result = enrollment_public_private_share(country_id=country_id, year=year)

    return Response({
        "public_private_share": result
    })
