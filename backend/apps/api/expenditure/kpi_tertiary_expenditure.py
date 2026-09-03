from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.expenditure.tertiary_expenditure import tertiary_expenditure_kpi

@api_view(["GET"])
def tertiary_expenditure_api(request):
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

    result = tertiary_expenditure_kpi(country_id=country_id, year=year)

    return Response({
        "tertiary_expenditure": result
    })
