from apps.warehouse.models import FactGraduation
from django.db.models import Avg

def average_graduation_rate(country_id=None, year=None):
    """
    Returns the average graduation rate per country (and optionally per year).
    
    Parameters:
    - country_id: optional, filter by country
    - year: optional, filter by year

    Output:
        [
            {"country_id": 2, "year": 2023, "average_graduation_rate": 85.5},
            ...
        ]
    """
    qs = FactGraduation.objects.all()

    # Optional filters
    if country_id is not None:
        qs = qs.filter(country__country_id=country_id)
    if year is not None:
        qs = qs.filter(year=year)

    # Aggregate average graduation rate per country and year with country name
    qs = qs.values("country__country_id", "country__country_name", "year").annotate(
        average_graduation_rate=Avg("percentage")
    ).order_by("country__country_id", "year")

    # Convert numeric to float
    output = []
    for r in qs:
        output.append({
            "country_id": r["country__country_id"],
            "country_name": r["country__country_name"],
            "year": r["year"],
            "average_graduation_rate": float(r["average_graduation_rate"]) if r["average_graduation_rate"] else 0
        })

    return output
