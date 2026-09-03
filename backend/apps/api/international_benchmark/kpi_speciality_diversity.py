from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.international_benchmark_KPI.kpi_speciality_diversity import speciality_diversity_index

@api_view(["GET"])
def speciality_diversity_kpi(request):
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")

    result = speciality_diversity_index(country_id=country_id, year=year)

    return Response(result)
