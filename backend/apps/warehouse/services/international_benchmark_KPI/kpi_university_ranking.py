from django.db.models import Avg, StdDev
from apps.warehouse.models import FactUniversityRanking, DimCountries
import numpy as np

def qs_rank_stats(country_id=None, year=None):
    """
    Returns average, median, and standard deviation of QS ranks for a country-year.
    """
    qs = FactUniversityRanking.objects.all()
    
    if country_id:
        qs = qs.filter(country_id=country_id)
    if year:
        qs = qs.filter(year=year)

    # Collect qs_rank values as a list
    ranks = list(qs.values_list("qs_rank", flat=True))

    if not ranks:
        result = {"average": None, "median": None, "stddev": None}
    else:
        average_rank = float(np.mean(ranks))
        median_rank = float(np.median(ranks))
        stddev_rank = float(np.std(ranks, ddof=1)) if len(ranks) > 1 else 0.0
        result = {
            "average": round(average_rank, 2),
            "median": round(median_rank, 2),
            "stddev": round(stddev_rank, 2)
        }
    
    if country_id:
        try:
            country_name = DimCountries.objects.get(country_id=country_id).country_name
        except DimCountries.DoesNotExist:
            country_name = None
        result["country_id"] = country_id
        result["country_name"] = country_name
    
    return result
