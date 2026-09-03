from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.international_benchmark_KPI.students_per_staff_level import students_per_staff_level

@api_view(["GET"])
def students_per_staff_level_kpi(request):
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")

    value = students_per_staff_level(country_id, year)

    return Response({
        "country_id": country_id,
        "year": year,
        "students_per_staff_level": float(value) if value else None
    })
