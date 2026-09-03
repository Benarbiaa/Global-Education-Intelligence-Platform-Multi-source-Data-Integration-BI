from apps.warehouse.models import FactGovernmentExpenditure
from django.db.models import Sum

def tertiary_expenditure_kpi(country_id=None, year=None):
    """
    Returns total tertiary education expenditure per country and year.

    Parameters:
    - country_id: optional, filter by specific country
    - year: optional, filter by year

    Output example:
        [
            {"country_id": 2, "country_name": "Italy", "year": 2023, "tertiary_expenditure": 5000000.00},
            ...
        ]
    """
    qs = FactGovernmentExpenditure.objects.all()

    # Apply filters
    if country_id is not None:
        qs = qs.filter(country__country_id=country_id)
    if year is not None:
        qs = qs.filter(year=year)

    # Aggregate total tertiary expenditure with country name
    qs = qs.values("country__country_id", "country__country_name", "year").annotate(
        total_tertiary=Sum("tertiary_expenditure")
    ).order_by("country__country_id", "year")

    # Convert Decimal to float
    output = []
    for r in qs:
        output.append({
            "country_id": r["country__country_id"],
            "country_name": r["country__country_name"],
            "year": r["year"],
            "tertiary_expenditure": float(r["total_tertiary"]) if r["total_tertiary"] else 0
        })

    return output
