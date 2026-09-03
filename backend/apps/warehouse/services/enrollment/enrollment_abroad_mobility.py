from apps.warehouse.models import FactEnrollmentAbroad
from django.db.models import Sum

def enrollment_abroad_mobility(country_id=None, year=None):
    """
    Returns Outbound Student Mobility Ratio (sum of percentages of students studying abroad)
    per country and year. Optionally filter by country and/or year.

    Output:
        [
            {"country_id": 2, "year": 2023, "outbound_mobility_ratio": 12.5},
            ...
        ]
    """
    qs = FactEnrollmentAbroad.objects.select_related('country').all()

    # Optional filters
    if country_id is not None:
        qs = qs.filter(country_id=country_id)
    if year is not None:
        qs = qs.filter(year=year)

    # Aggregate with country name
    qs = qs.values("country_id", "country__country_name", "year").annotate(
        outbound_mobility_ratio=Sum("percentage")
    ).order_by("country_id", "year")

    # Convert to float
    output = []
    for r in qs:
        output.append({
            "country_id": r["country_id"],
            "country_name": r["country__country_name"],
            "year": r["year"],
            "outbound_mobility_ratio": float(r["outbound_mobility_ratio"]) if r["outbound_mobility_ratio"] else 0
        })

    return output
