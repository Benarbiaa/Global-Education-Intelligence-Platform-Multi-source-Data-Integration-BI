from apps.warehouse.models import FactGovernmentExpenditure
from django.db.models import Avg

def education_expenditure_percentage(country_id=None, year=None):
    """
    Returns the average education expenditure as a percentage of government budget
    per country and year.

    Parameters:
    - country_id: optional, filter by specific country
    - year: optional, filter by year

    Output example:
        [
            {"country_id": 2, "year": 2023, "expenditure_percentage": 5.6},
            ...
        ]
    """
    qs = FactGovernmentExpenditure.objects.all()

    # Apply filters
    if country_id is not None:
        qs = qs.filter(country__country_id=country_id)
    if year is not None:
        qs = qs.filter(year=year)

    # Aggregate by country and year with country name
    qs = qs.values("country__country_id", "country__country_name", "year").annotate(
        avg_expenditure_percentage=Avg("expenditure_percentage")
    ).order_by("country__country_id", "year")

    # Convert to float for JSON
    output = []
    for r in qs:
        output.append({
            "country_id": r["country__country_id"],
            "country_name": r["country__country_name"],
            "year": r["year"],
            "expenditure_percentage": float(r["avg_expenditure_percentage"]) if r["avg_expenditure_percentage"] else 0
        })

    return output
