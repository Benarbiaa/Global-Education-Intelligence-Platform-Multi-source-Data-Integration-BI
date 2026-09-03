from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.expenditure.education_expenditure_percentage import education_expenditure_percentage

@api_view(["GET"])
def education_expenditure_kpi(request):
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

    result = education_expenditure_percentage(country_id=country_id, year=year)

    return Response({
        "education_expenditure_percentage": result
    })
