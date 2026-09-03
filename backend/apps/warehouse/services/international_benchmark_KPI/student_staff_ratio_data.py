from apps.warehouse.models import FactStudentStaffRatio, DimCountries
from django.db.models import Avg

def student_staff_ratio_data(country_id=None, year=None):
    """
    Returns student staff ratio data per country and year.
    Includes country name for better readability.

    Parameters:
    - country_id: optional, filter by specific country
    - year: optional, filter by year

    Output example:
        [
            {"country_id": 5, "country_name": "Australia", "year": 2013, "students_per_staff": 15.69},
            ...
        ]
    """
    qs = FactStudentStaffRatio.objects.all()

    # Apply filters
    if country_id is not None:
        qs = qs.filter(country_id=country_id)
    if year is not None:
        qs = qs.filter(year=year)

    # Get the data
    qs = qs.order_by("-year", "country_id")

    # Build output with country names
    output = []
    for record in qs:
        try:
            country = DimCountries.objects.get(country_id=record.country_id)
            country_name = country.country_name
        except DimCountries.DoesNotExist:
            country_name = "Unknown"
        
        output.append({
            "country_id": int(record.country_id),
            "country_name": country_name,
            "year": record.year,
            "students_per_staff": float(record.students_per_staff) if record.students_per_staff else 0
        })

    return output


def student_staff_ratio_summary(year=None):
    """
    Returns average student staff ratio globally or for a specific year.
    
    Parameters:
    - year: optional, filter by year
    """
    qs = FactStudentStaffRatio.objects.all()
    
    if year is not None:
        qs = qs.filter(year=year)
    
    result = qs.aggregate(
        avg_students_per_staff=Avg("students_per_staff"),
        total_records=__import__('django.db.models', fromlist=['Count'])('Count')('ratio_id')
    )
    
    return {
        "avg_students_per_staff": float(result["avg_students_per_staff"]) if result["avg_students_per_staff"] else 0,
        "year": year,
        "data_points": qs.count()
    }
