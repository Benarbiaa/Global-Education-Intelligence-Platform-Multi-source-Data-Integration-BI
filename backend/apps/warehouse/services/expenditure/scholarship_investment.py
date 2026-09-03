from apps.warehouse.models import FactGovernmentExpenditure
from django.db.models import Sum

def scholarship_investment(country_id=None, year=None):
    """
    Returns the total scholarships granted per country and year.

    Parameters:
    - country_id: optional, filter by specific country
    - year: optional, filter by year

    Output example:
        [
            {"country_id": 2, "year": 2023, "total_scholarships": 1200000.00},
            ...
        ]
    """
    qs = FactGovernmentExpenditure.objects.all()

    # Apply filters
    if country_id is not None:
        qs = qs.filter(country__country_id=country_id)
    if year is not None:
        qs = qs.filter(year=year)

    # Aggregate total scholarships with country name
    qs = qs.values("country__country_id", "country__country_name", "year").annotate(
        total_scholarships=Sum("scholarships")
    ).order_by("country__country_id", "year")

    # Convert to float
    output = []
    for r in qs:
        output.append({
            "country_id": r["country__country_id"],
            "country_name": r["country__country_name"],
            "year": r["year"],
            "total_scholarships": float(r["total_scholarships"]) if r["total_scholarships"] else 0
        })

    return output
