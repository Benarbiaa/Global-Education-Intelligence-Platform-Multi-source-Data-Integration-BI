"""
Run all foundation dimension tables
These must run BEFORE any mart pipelines
"""
from .foundation.dim_countries_pipeline import run_dim_countries_pipeline
from .foundation.dim_speciality_pipeline import run_dim_speciality_pipeline


def run_foundation():
    """Execute all foundation pipelines"""
    print("=" * 70)
    print("🏗️  STARTING FOUNDATION PIPELINES")
    print("=" * 70)
    
    # 1. Countries (required by all marts)
    run_dim_countries_pipeline()
    
    # 2. Speciality (required by education mart)
    run_dim_speciality_pipeline()
    
    print("\n" + "=" * 70)
    print("✅ FOUNDATION PIPELINES COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    run_foundation()