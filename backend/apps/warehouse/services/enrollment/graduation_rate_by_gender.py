from apps.warehouse.models import FactGraduation
from django.db.models import Avg

def graduation_rate_by_gender(country_id=None, year=None):
    """
    Returns the average graduation rate per country and gender.

    Parameters:
    - country_id: optional, filter by country
    - year: optional, filter by year

    Output example:
        [
            {"country_id": 2, "year": 2023, "gender": "Female", "average_graduation_rate": 70.0},
            {"country_id": 2, "year": 2023, "gender": "Male", "average_graduation_rate": 60.0},
            ...
        ]
    """
    qs = FactGraduation.objects.all()

    # Apply filters
    if country_id is not None:
        qs = qs.filter(country__country_id=country_id)
    if year is not None:
        qs = qs.filter(year=year)

    # Aggregate by country, year, and gender with country name
    qs = qs.values("country__country_id", "country__country_name", "year", "gender").annotate(
        average_graduation_rate=Avg("percentage")
    ).order_by("country__country_id", "year", "gender")

    # Convert to float for JSON
    output = []
    for r in qs:
        output.append({
            "country_id": r["country__country_id"],
            "country_name": r["country__country_name"],
            "year": r["year"],
            "gender": r["gender"],
            "average_graduation_rate": float(r["average_graduation_rate"]) if r["average_graduation_rate"] else 0
        })

    return output
