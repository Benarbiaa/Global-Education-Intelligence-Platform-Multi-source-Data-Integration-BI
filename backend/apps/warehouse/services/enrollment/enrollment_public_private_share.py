from apps.warehouse.models import FactEnrollment
from django.db.models import Sum, F, FloatField, Case, When, Q

def enrollment_public_private_share(country_id=None, year=None):
    """
    Returns public vs private enrollment share (% of total enrollment_percentage)
    per country (optionally filtered by country and/or year).

    Handles multiple institution_type variations containing 'Public' or 'Private'.
    """
    qs = FactEnrollment.objects.all()

    if country_id is not None:
        qs = qs.filter(country__country_id=country_id)
    if year is not None:
        qs = qs.filter(year=year)

    qs = qs.values("country__country_id", "country__country_name", "year").annotate(
        total=Sum("enrollment_percentage"),
        public_sum=Sum(
            Case(
                When(institution_type__icontains="Public", then=F("enrollment_percentage")),
                default=0,
                output_field=FloatField()
            )
        ),
        private_sum=Sum(
            Case(
                When(institution_type__icontains="Private", then=F("enrollment_percentage")),
                default=0,
                output_field=FloatField()
            )
        )
    ).order_by("country__country_id", "year")

    output = []
    for r in qs:
        total = float(r["total"] or 0)
        public_sum = float(r["public_sum"] or 0)
        private_sum = float(r["private_sum"] or 0)

        public_share = round((public_sum / total) * 100, 2) if total else 0
        private_share = round((private_sum / total) * 100, 2) if total else 0

        output.append({
            "country_id": r["country__country_id"],
            "country_name": r["country__country_name"],
            "year": r["year"],
            "public_share": public_share,
            "private_share": private_share
        })

    return output
