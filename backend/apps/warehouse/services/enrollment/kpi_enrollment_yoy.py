from django.db.models import Avg
from apps.warehouse.models import FactEnrollment, DimCountries

def enrollment_growth_yoy(country_id=None, year=None):
    """
    Computes Year-over-Year (YoY) growth in average enrollment_percentage.
    
    - country_id: optional, filter by specific country
    - year: optional, compute for this year and previous year
    """
    # Base queryset
    qs = FactEnrollment.objects.select_related('country').all()

    # Filter by country if given (use _id for ForeignKey)
    if country_id is not None:
        qs = qs.filter(country_id=country_id)

    # If a specific year is given, include that year and previous year
    if year is not None:
        qs = qs.filter(year__in=[year - 1, year])

    # Aggregate average enrollment per country and year with country name
    qs = (
        qs.values("country_id", "country__country_name", "year")
          .annotate(avg_enrollment=Avg("enrollment_percentage"))
          .order_by("country_id", "year")
    )

    data = list(qs)
    result = []
    previous_year_value = {}

    for row in data:
        c_id = row["country_id"]
        c_name = row["country__country_name"]
        yr = row["year"]
        avg_enroll = float(row["avg_enrollment"]) if row["avg_enrollment"] is not None else 0

        # Compute YoY if previous year exists
        if c_id in previous_year_value:
            prev_year, prev_avg, prev_name = previous_year_value[c_id]
            if yr == prev_year + 1 and prev_avg != 0:
                yoy = ((avg_enroll - prev_avg) / prev_avg) * 100
                result.append({
                    "country_id": c_id,
                    "country_name": c_name,
                    "year": yr,
                    "yoy_growth": round(yoy, 2)
                })

        # Update previous year record
        previous_year_value[c_id] = (yr, avg_enroll, c_name)

    return result
