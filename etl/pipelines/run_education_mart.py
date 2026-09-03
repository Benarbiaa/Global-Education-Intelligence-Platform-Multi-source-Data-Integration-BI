"""
Education Performance Data Mart
Depends on: dim_countries, dim_speciality (foundation)
"""
from .education_mart.fact_student_staff_pipeline import run_student_staff_pipeline
from .education_mart.fact_graduates_pipeline import run_graduates_pipeline
from .education_mart.fact_university_ranking_pipeline import run_university_ranking_pipeline


def run_education_mart():
    """Execute complete education mart ETL"""
    print("\n" + "=" * 70)
    print("🎓 STARTING EDUCATION PERFORMANCE MART")
    print("=" * 70)
    
    # 1. Student-staff ratio (depends on dim_countries)
    run_student_staff_pipeline()
    
    # 2. Tertiary graduates by field (depends on dim_countries + dim_speciality)
    run_graduates_pipeline()
    
    # 3. University rankings (depends on dim_countries)
    run_university_ranking_pipeline()
    
    print("\n" + "=" * 70)
    print("✅ EDUCATION MART COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    run_education_mart()