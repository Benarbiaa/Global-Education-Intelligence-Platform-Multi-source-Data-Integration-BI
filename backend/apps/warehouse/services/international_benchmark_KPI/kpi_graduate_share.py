from django.db.models import Avg
from apps.warehouse.models import FactTertiaryGraduates, DimCountries, DimSpeciality

def graduate_share_by_speciality(country_id=None, year=None, speciality_id=None):
    qs = FactTertiaryGraduates.objects.all()

    if country_id:
        qs = qs.filter(country_id=country_id)
    if year:
        qs = qs.filter(year=year)
    if speciality_id:
        qs = qs.filter(speciality_id=speciality_id)

    # Aggregate by speciality
    result = (
        qs.values("speciality_id")
        .annotate(graduate_percent_avg=Avg("graduate_percent"))
        .order_by("-graduate_percent_avg")
    )

    # Add country_name if country_id is provided
    country_name = None
    if country_id:
        try:
            country_name = DimCountries.objects.get(country_id=country_id).country_name
        except DimCountries.DoesNotExist:
            country_name = None

    # Convert to list of dicts and attach speciality names when available
    speciality_ids = [r["speciality_id"] for r in result]
    specialities = {}
    if speciality_ids:
        qs_spec = DimSpeciality.objects.filter(speciality_id__in=speciality_ids)
        for s in qs_spec:
            specialities[int(s.speciality_id)] = s.speciality_name

    output = []
    for r in result:
        sid = int(r["speciality_id"]) if r["speciality_id"] is not None else None
        name = specialities.get(sid) if sid is not None else None
        item = {
            "speciality_id": sid,
            "speciality_name": name,
            "field_name": name or None,
            "graduate_percent": r["graduate_percent_avg"],
        }
        if country_name:
            item["country_name"] = country_name
        output.append(item)

    return output
