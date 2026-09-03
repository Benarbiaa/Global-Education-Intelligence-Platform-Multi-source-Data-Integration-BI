"""
Enrollment & Graduation Data Mart
Depends on: dim_countries (foundation)
Contains: dim_field + 3 fact tables
"""
from .enrollment_mart.dim_field_pipeline import run_dim_field_pipeline
from .enrollment_mart.fact_enrollment_pipeline import run_fact_enrollment_pipeline
from .enrollment_mart.fact_graduation_pipeline import run_fact_graduation_pipeline
from .enrollment_mart.fact_enrollment_abroad_pipeline import run_fact_enrollment_abroad_pipeline


def run_enrollment_mart():
    """Execute complete enrollment mart ETL"""
    print("\n" + "=" * 70)
    print("📚 STARTING ENROLLMENT & GRADUATION MART")
    print("=" * 70)
    
    # 1. Load field dimension (education levels)
    run_dim_field_pipeline()
    
    # 2. Load enrollment facts (depends on dim_field + dim_countries)
    run_fact_enrollment_pipeline()
    
    # 3. Load graduation facts (depends on dim_countries)
    run_fact_graduation_pipeline()
    
    # 4. Load enrollment abroad facts (depends on dim_countries)
    run_fact_enrollment_abroad_pipeline()
    
    print("\n" + "=" * 70)
    print("✅ ENROLLMENT MART COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    run_enrollment_mart()