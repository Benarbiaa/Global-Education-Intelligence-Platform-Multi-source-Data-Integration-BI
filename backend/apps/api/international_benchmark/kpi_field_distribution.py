from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.warehouse.services.international_benchmark_KPI.field_distribution import (
    field_distribution_by_country,
    field_distribution_global,
    field_distribution_comparison
)

@api_view(["GET"])
def field_distribution_kpi(request):
    """
    Field of Study International Distribution KPI Endpoint
    Shows how different fields of study are distributed across countries
    
    Query Parameters:
    - country_id: optional, filter by specific country
    - year: optional, filter by specific year
    - global: optional (true/false), return only global statistics
    - field_id: optional, compare a specific field across all countries
    
    Example URLs:
    - /api/kpi/field-distribution/
    - /api/kpi/field-distribution/?country_id=58
    - /api/kpi/field-distribution/?year=2022
    - /api/kpi/field-distribution/?global=true&year=2022
    - /api/kpi/field-distribution/?field_id=F001&year=2022
    """
    country_id = request.GET.get("country_id")
    year = request.GET.get("year")
    global_only = request.GET.get("global", "false").lower() == "true"
    field_id = request.GET.get("field_id")
    
    # Convert to int if provided
    try:
        country_id = int(country_id) if country_id else None
    except (ValueError, TypeError):
        country_id = None
    
    try:
        year = int(year) if year else None
    except (ValueError, TypeError):
        year = None
    
    # If field_id is provided, show comparison across countries
    if field_id:
        result = field_distribution_comparison(field_id=field_id, year=year)
        return Response({
            "status": "success",
            "type": "field_comparison",
            "field_id": field_id,
            "data": result,
            "count": len(result)
        })
    
    # If global=true, show only global statistics
    if global_only:
        result = field_distribution_global(year=year)
        return Response({
            "status": "success",
            "type": "global_summary",
            "year": year,
            "data": result,
            "count": len(result)
        })
    
    # Otherwise, show detailed by country
    result = field_distribution_by_country(country_id=country_id, year=year)
    return Response({
        "status": "success",
        "type": "detailed",
        "data": result,
        "count": len(result)
    })
