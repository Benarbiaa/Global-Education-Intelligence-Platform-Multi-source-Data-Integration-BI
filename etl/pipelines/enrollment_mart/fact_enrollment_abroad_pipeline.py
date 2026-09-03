import os
from sqlalchemy import create_engine

from loaders.local_csv_loader import load_enrollment_abroad_data
from transformers.transform_enrollment import transform_fact_enrollment_abroad
from transformers.country_mapping import apply_country_mapping
from loaders.load_facts import load_fact_enrollment_abroad

DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_fact_enrollment_abroad_pipeline():
    """ETL pipeline for fact_enrollment_abroad"""
    print("\n✈️ Starting FACT_ENROLLMENT_ABROAD pipeline...")
    
    # Extract
    df_enr_m, df_enr_f = load_enrollment_abroad_data()
    
    # Transform
    fact_df = transform_fact_enrollment_abroad(df_enr_m, df_enr_f)
    
    # Map countries
    fact_df = apply_country_mapping(fact_df, engine)
    
    # Add enrollment_abroad_id
    fact_df['enrollment_abroad_id'] = [f"EAB{i:04d}" for i in range(1, len(fact_df) + 1)]
    
    print("\n📘 FACT_ENROLLMENT_ABROAD preview:")
    print(fact_df.head(20).to_string(index=False))
    
    # Save preview
    fact_df.to_csv("data/fact_enrollment_abroad_preview.csv", index=False)
    print("\n💾 Saved preview → data/fact_enrollment_abroad_preview.csv")
    
    # Load
    load_fact_enrollment_abroad(fact_df, engine)
    
    print("\n✅ FACT_ENROLLMENT_ABROAD pipeline completed!")


if __name__ == "__main__":
    run_fact_enrollment_abroad_pipeline()