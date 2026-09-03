from apps.warehouse.models import FactTertiaryGraduates, DimCountries

def speciality_diversity_index(country_id=None, year=None):
    """
    Returns the Herfindahl-Hirschman Index (HHI) for graduate_percent by speciality.
    - If country_id is given → HHI for that country.
    - If country_id is None → HHI for all countries (filtered by year if provided).
    HHI = sum((graduate_percent / 100)^2)
    Lower HHI → more diversity
    """
    if country_id:
        qs = FactTertiaryGraduates.objects.all()
        if year:
            qs = qs.filter(year=year)
        qs = qs.filter(country_id=country_id)
        graduate_percents = list(qs.values_list("graduate_percent", flat=True))
        
        try:
            country_name = DimCountries.objects.get(country_id=country_id).country_name
        except DimCountries.DoesNotExist:
            country_name = None

        # Ignore None values
        hhi = sum((p / 100) ** 2 for p in graduate_percents if p is not None) if graduate_percents else None
        return {"country_id": country_id, "country_name": country_name, "year": year, "hhi": round(hhi, 4) if hhi is not None else None}

    else:
        countries = FactTertiaryGraduates.objects.all()
        if year:
            countries = countries.filter(year=year)
        country_ids = countries.values_list("country_id", flat=True).distinct()

        result = []
        for c_id in country_ids:
            qs = FactTertiaryGraduates.objects.filter(country_id=c_id)
            if year:
                qs = qs.filter(year=year)
            graduate_percents = list(qs.values_list("graduate_percent", flat=True))
            
            try:
                country_name = DimCountries.objects.get(country_id=c_id).country_name
            except DimCountries.DoesNotExist:
                country_name = None

            hhi = sum((p / 100) ** 2 for p in graduate_percents if p is not None) if graduate_percents else None
            result.append({"country_id": c_id, "country_name": country_name, "year": year, "hhi": round(hhi, 4) if hhi is not None else None})

        return result
