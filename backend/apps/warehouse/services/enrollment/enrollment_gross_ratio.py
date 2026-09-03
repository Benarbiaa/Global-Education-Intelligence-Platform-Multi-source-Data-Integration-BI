from apps.warehouse.models import FactEnrollment
from django.db.models import Avg

def enrollment_gross_ratio(country_id=None, year=None):
    """
    Returns the average enrollment_percentage grouped by country and year.
    - If both filters are None → returns for ALL countries and years.
    - If country_id is provided → filter by country.
    - If year is provided → filter by year.
    """

    qs = FactEnrollment.objects.select_related('country').all()

    if country_id:
        qs = qs.filter(country_id=country_id)
    if year:
        qs = qs.filter(year=year)

    # Group by country and year with country name
    results = (
        qs.values("country_id", "country__country_name", "year")
          .annotate(gross_enrollment_ratio=Avg("enrollment_percentage"))
          .order_by("country_id", "year")
    )

    # Convert numeric to float
    output = []
    for r in results:
        output.append({
            "country_id": r["country_id"],
            "country_name": r["country__country_name"],
            "year": r["year"],
            "gross_enrollment_ratio": float(r["gross_enrollment_ratio"]) if r["gross_enrollment_ratio"] else None
        })

    return output
