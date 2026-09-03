"""
Research & Innovation Data Mart
Depends on: dim_countries (foundation)
"""
from .research_mart.dim_institution_pipeline import run_institution_pipeline
from .research_mart.fact_research_pipeline import run_research_pipeline
from .research_mart.fact_investment_pipeline import run_investment_pipeline


def run_research_mart():
    """Execute complete research mart ETL"""
    print("\n" + "=" * 70)
    print("🔬 STARTING RESEARCH & INNOVATION MART")
    print("=" * 70)
    
    # 1. Load institution dimension (depends on dim_countries)
    run_institution_pipeline()
    
    # 2. Load research facts (depends on dim_institution)
    run_research_pipeline()
    
    # 3. Load investment facts (depends on dim_countries)
    run_investment_pipeline()
    
    print("\n" + "=" * 70)
    print("✅ RESEARCH MART COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    run_research_mart()