from apps.warehouse.models import FactStudentStaffRatio, DimCountries
from django.db.models import Avg

def students_per_staff_yoy(country_id=None, year=None):
    """
    Returns the YoY % change in students_per_staff for a given country and year.
    Formula: (current_year - previous_year) / previous_year * 100
    """
    if year is None:
        return None  # Cannot compute YoY without a reference year

    current_year_qs = FactStudentStaffRatio.objects.filter(year=year)
    prev_year_qs = FactStudentStaffRatio.objects.filter(year=year-1)

    if country_id:
        current_year_qs = current_year_qs.filter(country_id=country_id)
        prev_year_qs = prev_year_qs.filter(country_id=country_id)

    # Compute average for each year
    current_avg = current_year_qs.aggregate(avg_current=Avg("students_per_staff"))["avg_current"]
    prev_avg = prev_year_qs.aggregate(avg_prev=Avg("students_per_staff"))["avg_prev"]

    if current_avg is None or prev_avg is None or prev_avg == 0:
        return None

    yoy_change = (current_avg - prev_avg) / prev_avg * 100
    
    result = {"yoy_change": round(yoy_change, 2) if yoy_change else None}
    
    if country_id:
        try:
            country_name = DimCountries.objects.get(country_id=country_id).country_name
        except DimCountries.DoesNotExist:
            country_name = None
        result["country_id"] = country_id
        result["country_name"] = country_name
    
    return result
