import os
from sqlalchemy import create_engine

from loaders.local_csv_loader import load_graduates_csv
from transformers.transform_education import transform_tertiary_graduates
from loaders.load_facts import load_fact_tertiary_graduates

DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_graduates_pipeline():
    """ETL pipeline for fact_tertiary_graduates"""
    print("\n🎓 Starting FACT_TERTIARY_GRADUATES pipeline...")
    
    # Extract
    pivoted_df = load_graduates_csv()
    
    # Transform
    fact_df = transform_tertiary_graduates(pivoted_df, engine)
    
    print("\n📘 FACT_TERTIARY_GRADUATES preview:")
    print(fact_df.head(20).to_string(index=False))
    
    # Save preview
    fact_df.to_csv("data/fact_tertiary_graduates_preview.csv", index=False)
    print("\n💾 Saved preview → data/fact_tertiary_graduates_preview.csv")
    
    # Load
    load_fact_tertiary_graduates(fact_df, engine)
    
    print("\n✅ FACT_TERTIARY_GRADUATES pipeline completed!")


if __name__ == "__main__":
    run_graduates_pipeline()