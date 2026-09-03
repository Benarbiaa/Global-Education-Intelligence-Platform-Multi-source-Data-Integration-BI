from apps.warehouse.models import FactEnrollment, DimField, DimCountries
from django.db.models import Sum, Count, Avg

def field_distribution_by_country(country_id=None, year=None):
    """
    Returns the distribution of fields of study by country.
    Shows enrollment percentage for each field in each country.

    Parameters:
    - country_id: optional, filter by specific country
    - year: optional, filter by specific year

    Output example:
        [
            {
                "country_id": 58, "country_name": "Italy", "year": 2022,
                "field_id": "F001", "field_name": "Short-cycle tertiary education",
                "avg_enrollment_percentage": 54.6295
            },
            ...
        ]
    """
    qs = FactEnrollment.objects.select_related('country', 'field').all()

    # Apply filters
    if country_id is not None:
        qs = qs.filter(country_id=country_id)
    if year is not None:
        qs = qs.filter(year=year)

    # Aggregate by country, year, and field
    qs = qs.values(
        "country_id", "country__country_name", "year",
        "field_id", "field__name"
    ).annotate(
        avg_enrollment=Avg("enrollment_percentage")
    ).order_by("country_id", "year", "-avg_enrollment")

    # Build output
    output = []
    for record in qs:
        output.append({
            "country_id": record["country_id"],
            "country_name": record["country__country_name"],
            "year": record["year"],
            "field_id": record["field_id"],
            "field_name": record["field__name"],
            "avg_enrollment_percentage": float(record["avg_enrollment"]) if record["avg_enrollment"] else 0
        })

    return output


def field_distribution_global(year=None):
    """
    Returns global field distribution (average across all countries).
    
    Parameters:
    - year: optional, filter by specific year
    """
    qs = FactEnrollment.objects.select_related('field').all()
    
    if year is not None:
        qs = qs.filter(year=year)
    
    # Aggregate globally by field
    qs = qs.values("field_id", "field__name").annotate(
        avg_enrollment=Avg("enrollment_percentage"),
        total_records=Count("enrollment_id"),
        countries_count=Count("country_id", distinct=True)
    ).order_by("-avg_enrollment")
    
    output = []
    for record in qs:
        output.append({
            "field_id": record["field_id"],
            "field_name": record["field__name"],
            "avg_enrollment_percentage": float(record["avg_enrollment"]) if record["avg_enrollment"] else 0,
            "countries_represented": record["countries_count"],
            "data_points": record["total_records"]
        })
    
    return output


def field_distribution_comparison(field_id, year=None):
    """
    Returns field enrollment comparison across all countries for a specific field.
    
    Parameters:
    - field_id: required, the field to compare
    - year: optional, filter by specific year
    """
    qs = FactEnrollment.objects.select_related('country', 'field').filter(field_id=field_id)
    
    if year is not None:
        qs = qs.filter(year=year)
    
    # Aggregate by country
    qs = qs.values(
        "country_id", "country__country_name", "year"
    ).annotate(
        avg_enrollment=Avg("enrollment_percentage")
    ).order_by("-avg_enrollment")
    
    output = []
    for record in qs:
        output.append({
            "country_id": record["country_id"],
            "country_name": record["country__country_name"],
            "year": record["year"],
            "enrollment_percentage": float(record["avg_enrollment"]) if record["avg_enrollment"] else 0
        })
    
    return output
