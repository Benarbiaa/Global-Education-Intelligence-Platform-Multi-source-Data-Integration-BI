from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.international_benchmark_KPI.student_staff_ratio_data import (
    student_staff_ratio_data,
    student_staff_ratio_summary
)

@api_view(["GET"])
def student_staff_ratio_kpi(request):
    """
    Student Staff Ratio KPI Endpoint
    Returns student staff ratio data per country and year
    
    Query Parameters:
    - country_id: optional, filter by specific country
    - year: optional, filter by specific year
    - summary: optional (true/false), return only summary statistics
    
    Example URLs:
    - /api/kpi/student-staff-ratio/
    - /api/kpi/student-staff-ratio/?country_id=58
    - /api/kpi/student-staff-ratio/?year=2022
    - /api/kpi/student-staff-ratio/?summary=true
    """
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")
    summary_only = request.GET.get("summary", "false").lower() == "true"
    
    # Convert to int if provided
    try:
        country_id = int(country_id) if country_id else None
    except (ValueError, TypeError):
        country_id = None
    
    try:
        year = int(year) if year else None
    except (ValueError, TypeError):
        year = None
    
    if summary_only:
        result = student_staff_ratio_summary(year=year)
        return Response({
            "status": "success",
            "type": "summary",
            "data": result
        })
    else:
        result = student_staff_ratio_data(country_id=country_id, year=year)
        return Response({
            "status": "success",
            "type": "detailed",
            "data": result,
            "count": len(result)
        })
