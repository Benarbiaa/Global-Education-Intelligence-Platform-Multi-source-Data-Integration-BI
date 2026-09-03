from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.international_benchmark_KPI.kpi_country_avg_score import country_average_overall_score

@api_view(["GET"])
def country_avg_score_kpi(request):
    country_id = request.GET.get("country_id")

    result = country_average_overall_score(country_id=country_id)

    return Response({
        "country_average_score": result
    })
