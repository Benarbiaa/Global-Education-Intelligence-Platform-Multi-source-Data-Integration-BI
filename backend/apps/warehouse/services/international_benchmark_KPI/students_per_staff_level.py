from apps.warehouse.models import FactStudentStaffRatio
from django.db.models import Avg

def students_per_staff_level(country_id=None, year=None):
    qs = FactStudentStaffRatio.objects.all()
    if country_id:
        qs = qs.filter(country_id=country_id)
    if year:
        qs = qs.filter(year=year)
    result = qs.aggregate(level=Avg("students_per_staff"))
    return result["level"]

