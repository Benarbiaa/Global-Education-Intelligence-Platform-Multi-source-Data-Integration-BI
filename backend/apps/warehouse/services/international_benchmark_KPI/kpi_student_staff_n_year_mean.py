from apps.warehouse.models import FactStudentStaffRatio, DimCountries
from django.db.models import Avg

def students_per_staff_n_year_mean(country_id=None, year=None, n_years=3):
    """
    Returns the average students_per_staff over the last n_years including the specified year.
    """
    if year is None:
        return None  # Cannot compute N-year mean without a reference year

    # Define the year window
    start_year = int(year) - n_years + 1
    end_year = int(year)

    qs = FactStudentStaffRatio.objects.filter(year__gte=start_year, year__lte=end_year)

    # Apply country filter if given
    if country_id:
        qs = qs.filter(country_id=country_id)

    result_value = qs.aggregate(mean_level=Avg("students_per_staff"))["mean_level"]
    
    result = {"mean_level": round(float(result_value), 2) if result_value else None}
    
    if country_id:
        try:
            country_name = DimCountries.objects.get(country_id=country_id).country_name
        except DimCountries.DoesNotExist:
            country_name = None
        result["country_id"] = country_id
        result["country_name"] = country_name
    
    return result
