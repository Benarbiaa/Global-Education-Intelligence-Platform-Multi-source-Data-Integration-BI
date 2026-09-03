from django.db.models import Avg
from apps.warehouse.models import FactUniversityRanking, DimCountries

def country_average_overall_score(country_id=None):
    """
    Returns the average overall_score of universities for a country.
    If country_id is None, returns a list of average per country.
    Output format:
        - If country_id given: {"country_id": 33, "country_name": "Italy", "average_score": 74.3}
        - If country_id None: [{"country_id": 33, "country_name": "Italy", "average_score": 74.3}, ...]
    """
    if country_id:
        qs = FactUniversityRanking.objects.filter(country_id=country_id)
        avg_score = qs.aggregate(avg_score=Avg("overall_score"))["avg_score"]
        try:
            country_name = DimCountries.objects.get(country_id=country_id).country_name
        except DimCountries.DoesNotExist:
            country_name = None
        return {"country_id": country_id, "country_name": country_name, "average_score": round(float(avg_score), 2) if avg_score else None}
    else:
        # Average per country with country names
        countries = FactUniversityRanking.objects.values_list("country_id", flat=True).distinct()
        result = []
        for c_id in countries:
            qs = FactUniversityRanking.objects.filter(country_id=c_id)
            avg_score = qs.aggregate(avg_score=Avg("overall_score"))["avg_score"]
            try:
                country_name = DimCountries.objects.get(country_id=c_id).country_name
            except DimCountries.DoesNotExist:
                country_name = None
            result.append({"country_id": c_id, "country_name": country_name, "average_score": round(float(avg_score), 2) if avg_score else None})
        return result
