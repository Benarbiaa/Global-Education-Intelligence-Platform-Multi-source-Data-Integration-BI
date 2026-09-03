import os
from sqlalchemy import create_engine

from loaders.local_csv_loader import load_enrollment_oecd
from transformers.transform_enrollment import transform_dim_field, transform_fact_enrollment
from transformers.country_mapping import apply_country_mapping
from loaders.load_facts import load_fact_enrollment

DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_fact_enrollment_pipeline():
    """ETL pipeline for fact_enrollment"""
    print("\n📊 Starting FACT_ENROLLMENT pipeline...")
    
    # Extract
    df_oecd = load_enrollment_oecd()
    
    # Transform (need dim_field for mapping)
    dim_field = transform_dim_field(df_oecd)
    fact_df = transform_fact_enrollment(df_oecd, dim_field)
    
    # Map countries
    fact_df = apply_country_mapping(fact_df, engine)
    
    # Add enrollment_id
    fact_df['enrollment_id'] = [f"ENR{i:04d}" for i in range(1, len(fact_df) + 1)]
    
    print("\n📘 FACT_ENROLLMENT preview:")
    print(fact_df.head(20).to_string(index=False))
    
    # Save preview
    fact_df.to_csv("data/fact_enrollment_preview.csv", index=False)
    print("\n💾 Saved preview → data/fact_enrollment_preview.csv")
    
    # Load
    load_fact_enrollment(fact_df, engine)
    
    print("\n✅ FACT_ENROLLMENT pipeline completed!")


if __name__ == "__main__":
    run_fact_enrollment_pipeline()