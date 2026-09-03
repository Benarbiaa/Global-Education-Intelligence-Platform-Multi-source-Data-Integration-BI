import os
from sqlalchemy import create_engine

from loaders.local_csv_loader import load_graduation_data
from transformers.transform_enrollment import transform_fact_graduation
from transformers.country_mapping import apply_country_mapping
from loaders.load_facts import load_fact_graduation

DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_fact_graduation_pipeline():
    """ETL pipeline for fact_graduation"""
    print("\n🎓 Starting FACT_GRADUATION pipeline...")
    
    # Extract
    df_grad_m, df_grad_f = load_graduation_data()
    
    # Transform
    fact_df = transform_fact_graduation(df_grad_m, df_grad_f)
    
    # Map countries
    fact_df = apply_country_mapping(fact_df, engine)
    
    # Add graduation_id
    fact_df['graduation_id'] = [f"GRD{i:04d}" for i in range(1, len(fact_df) + 1)]
    
    print("\n📘 FACT_GRADUATION preview:")
    print(fact_df.head(20).to_string(index=False))
    
    # Save preview
    fact_df.to_csv("data/fact_graduation_preview.csv", index=False)
    print("\n💾 Saved preview → data/fact_graduation_preview.csv")
    
    # Load
    load_fact_graduation(fact_df, engine)
    
    print("\n✅ FACT_GRADUATION pipeline completed!")


if __name__ == "__main__":
    run_fact_graduation_pipeline()