from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.international_benchmark_KPI.kpi_top_universities import top_universities_by_score

@api_view(["GET"])
def top_universities_kpi(request):
    country_id = request.GET.get("country_id")
    top_n = request.GET.get("top_n", 3)

    result = top_universities_by_score(
        country_id=country_id,
        top_n=int(top_n)
    )

    return Response({
        "top_universities": result
    })
