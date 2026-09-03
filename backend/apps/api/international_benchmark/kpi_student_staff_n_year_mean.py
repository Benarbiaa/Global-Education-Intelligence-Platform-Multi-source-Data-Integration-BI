from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.international_benchmark_KPI.kpi_student_staff_n_year_mean import students_per_staff_n_year_mean

@api_view(["GET"])
def students_per_staff_n_year_mean_kpi(request):
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")
    n_years = request.GET.get("n_years", 3)  # default 3-year mean

    try:
        n_years = int(n_years)
    except ValueError:
        n_years = 3

    value = students_per_staff_n_year_mean(country_id=country_id, year=year, n_years=n_years)

    return Response({
        "country_id": country_id,
        "year": year,
        "n_years": n_years,
        "students_per_staff_n_year_mean": float(value) if value else None
    })
