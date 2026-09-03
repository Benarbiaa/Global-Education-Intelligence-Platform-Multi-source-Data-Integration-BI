"""
Government Expenditure Data Mart
Depends on: dim_countries (foundation)
Contains: 1 fact table
"""
from .expenditure_mart.fact_expenditure_pipeline import run_fact_expenditure_pipeline


def run_expenditure_mart():
    """Execute complete expenditure mart ETL"""
    print("\n" + "=" * 70)
    print("💰 STARTING GOVERNMENT EXPENDITURE MART")
    print("=" * 70)
    
    # Load expenditure facts (depends on dim_countries)
    run_fact_expenditure_pipeline()
    
    print("\n" + "=" * 70)
    print("✅ EXPENDITURE MART COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    run_expenditure_mart()