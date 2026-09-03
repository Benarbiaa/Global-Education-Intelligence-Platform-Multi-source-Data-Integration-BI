from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.international_benchmark_KPI.kpi_graduate_share import graduate_share_by_speciality

@api_view(["GET"])
def graduate_share_by_speciality_kpi(request):
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")

    result = graduate_share_by_speciality(country_id=country_id, year=year)

    return Response({
        "country_id": country_id,
        "year": year,
        "graduate_share_by_speciality": result
    })
