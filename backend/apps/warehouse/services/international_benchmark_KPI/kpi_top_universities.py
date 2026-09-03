from apps.warehouse.models import FactUniversityRanking, DimCountries
from django.db.models import F

def top_universities_by_score(country_id=None, top_n=3):
    """
    Returns top N universities by overall_score.
    - If country_id is given → top N for that country.
    - If country_id is None → top N for each country.
    Output format:
        [{"country_id": 33, "country_name": "Italy", "top_universities": [{"university_name": "...", "overall_score": ...}, ...]}, ...]
    """
    if country_id:
        # Top N for the given country
        qs = FactUniversityRanking.objects.filter(country_id=country_id).order_by("-overall_score")[:top_n]
        try:
            country_name = DimCountries.objects.get(country_id=country_id).country_name
        except DimCountries.DoesNotExist:
            country_name = None
        return [{
            "country_id": country_id,
            "country_name": country_name,
            "top_universities": [
                {"university_name": uni.university_name, "overall_score": float(uni.overall_score)}
                for uni in qs
            ]
        }]
    else:
        # Top N per country
        countries = FactUniversityRanking.objects.values_list("country_id", flat=True).distinct()
        result = []

        for c_id in countries:
            qs = FactUniversityRanking.objects.filter(country_id=c_id).order_by("-overall_score")[:top_n]
            try:
                country_name = DimCountries.objects.get(country_id=c_id).country_name
            except DimCountries.DoesNotExist:
                country_name = None
            result.append({
                "country_id": c_id,
                "country_name": country_name,
                "top_universities": [
                    {"university_name": uni.university_name, "overall_score": float(uni.overall_score)}
                    for uni in qs
                ]
            })

        return result
