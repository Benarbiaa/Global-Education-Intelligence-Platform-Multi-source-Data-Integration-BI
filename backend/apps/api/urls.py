from django.urls import path
from apps.api.international_benchmark.kpi_student_staff_level import students_per_staff_level_kpi
from apps.api.international_benchmark.kpi_student_staff_n_year_mean import students_per_staff_n_year_mean_kpi
from apps.api.international_benchmark.kpi_student_staff_yoy import students_per_staff_yoy_kpi
from apps.api.international_benchmark.kpi_student_staff_ratio_detailed import student_staff_ratio_kpi
from apps.api.international_benchmark.kpi_graduate_share import graduate_share_by_speciality_kpi
from apps.api.international_benchmark.kpi_university_ranking_stats import qs_rank_stats_kpi
from apps.api.international_benchmark.kpi_top_universities import top_universities_kpi
from apps.api.international_benchmark.kpi_country_avg_score import country_avg_score_kpi
from apps.api.international_benchmark.kpi_speciality_diversity import speciality_diversity_kpi
from apps.api.international_benchmark.kpi_field_distribution import field_distribution_kpi
from apps.api.enrollment.kpi_enrollment_gross_ratio import enrollment_gross_ratio_kpi
from apps.api.enrollment.kpi_enrollment_yoy import enrollment_growth_yoy_kpi
from apps.api.enrollment.kpi_enrollment_public_private_share import enrollment_public_private_kpi
from apps.api.enrollment.kpi_enrollment_abroad_mobility import enrollment_abroad_mobility_kpi
from apps.api.enrollment.kpi_graduation_rate import average_graduation_rate_kpi
from apps.api.enrollment.kpi_graduation_rate_by_gender import graduation_rate_by_gender_kpi
from apps.api.expenditure.kpi_education_expenditure import education_expenditure_kpi
from apps.api.expenditure.kpi_scholarship_investment import scholarship_investment_kpi
from apps.api.expenditure.kpi_tertiary_expenditure import tertiary_expenditure_api
from django.urls import path, include


urlpatterns = [
    path('warehouse/', include('apps.warehouse.services.research_kpis.urls')),
    path(
        "kpi/tertiary-expenditure/",
        tertiary_expenditure_api,
        name="tertiary_expenditure_kpi"
    ),
    path(
        "kpi/scholarship-investment/",
        scholarship_investment_kpi,
        name="scholarship_investment_kpi"
    ),
    path(
        "kpi/education-expenditure/",
        education_expenditure_kpi,
        name="education_expenditure_kpi"
    ),
    path(
        "kpi/graduation-rate-by-gender/",
        graduation_rate_by_gender_kpi,
        name="graduation_rate_by_gender_kpi"
    ), 
    path(
        "kpi/average-graduation-rate/",
        average_graduation_rate_kpi,
        name="average_graduation_rate_kpi"
    ),
    path(
        "kpi/enrollment-abroad-mobility/",
        enrollment_abroad_mobility_kpi,
        name="enrollment_abroad_mobility_kpi"
    ),
    path(
        "kpi/enrollment-public-private/",
        enrollment_public_private_kpi,
        name="enrollment_public_private_kpi"
    ),
    path(
        "kpi/enrollment-growth-yoy/",
        enrollment_growth_yoy_kpi,  # <-- use the API view, NOT the service
        name="enrollment_growth_yoy_kpi"
    ),
    path("kpi/enrollment-gross-ratio/", enrollment_gross_ratio_kpi, name="enrollment_gross_ratio_kpi"),
    path("kpi/students-staff-level/", students_per_staff_level_kpi, name="students_per_staff_level_kpi"),
    path(
        "kpi/students-staff-n-year-mean/",
        students_per_staff_n_year_mean_kpi,
        name="students_per_staff_n_year_mean_kpi"
    ),
    path(
        "kpi/students-staff-yoy/",
        students_per_staff_yoy_kpi,
        name="students_per_staff_yoy_kpi"
    ),
    path(
        "kpi/graduate-share/",
        graduate_share_by_speciality_kpi,
        name="graduate_share_by_speciality_kpi"
    ),
    path(
        "kpi/university-qs-stats/",
        qs_rank_stats_kpi,
        name="qs_rank_stats_kpi"
    ),
    path(
        "kpi/top-universities/",
        top_universities_kpi,
        name="top_universities_kpi"
    ),
    path(
        "kpi/country-average-score/",
        country_avg_score_kpi,
        name="country_avg_score_kpi"
    ),
    path(
        "kpi/speciality-diversity/",
        speciality_diversity_kpi,
        name="speciality_diversity_kpi"
    ),
    path(
        "kpi/student-staff-ratio/",
        student_staff_ratio_kpi,
        name="student_staff_ratio_kpi"
    ),
    path(
        "kpi/field-distribution/",
        field_distribution_kpi,
        name="field_distribution_kpi"
    ),
]
