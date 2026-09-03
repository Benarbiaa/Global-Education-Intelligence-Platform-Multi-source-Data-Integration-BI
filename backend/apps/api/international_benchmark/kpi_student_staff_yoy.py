from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.international_benchmark_KPI.kpi_student_staff_yoy import students_per_staff_yoy

@api_view(["GET"])
def students_per_staff_yoy_kpi(request):
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")

    yoy_value = students_per_staff_yoy(country_id=country_id, year=int(year) if year else None)

    return Response({
        "country_id": country_id,
        "year": year,
        "students_per_staff_yoy_percent": round(float(yoy_value), 2) if yoy_value is not None else None
    })
