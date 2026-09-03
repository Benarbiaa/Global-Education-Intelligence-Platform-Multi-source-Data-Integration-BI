from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.international_benchmark_KPI.kpi_university_ranking import qs_rank_stats

@api_view(["GET"])
def qs_rank_stats_kpi(request):
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")

    result = qs_rank_stats(country_id=country_id, year=year)

    return Response({
        "country_id": country_id,
        "year": year,
        "qs_rank_stats": result
    })
