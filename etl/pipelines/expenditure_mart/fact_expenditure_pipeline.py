import os
from sqlalchemy import create_engine

from loaders.local_csv_loader import load_expenditure_data
from transformers.transform_expenditure import transform_fact_government_expenditure
from transformers.country_mapping import apply_country_mapping
from loaders.load_facts import load_fact_government_expenditure

DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_fact_expenditure_pipeline():
    """ETL pipeline for fact_government_expenditure"""
    print("\n💰 Starting FACT_GOVERNMENT_EXPENDITURE pipeline...")
    
    # Extract
    dfs_expenditure = load_expenditure_data()
    
    # Transform
    fact_df = transform_fact_government_expenditure(dfs_expenditure)
    
    # Map countries
    fact_df = apply_country_mapping(fact_df, engine)
    
    print("\n📘 FACT_GOVERNMENT_EXPENDITURE preview:")
    print(fact_df.head(20).to_string(index=False))
    
    # Save preview
    fact_df.to_csv("data/fact_government_expenditure_preview.csv", index=False)
    print("\n💾 Saved preview → data/fact_government_expenditure_preview.csv")
    
    # Load
    load_fact_government_expenditure(fact_df, engine)
    
    print("\n✅ FACT_GOVERNMENT_EXPENDITURE pipeline completed!")


if __name__ == "__main__":
    run_fact_expenditure_pipeline()