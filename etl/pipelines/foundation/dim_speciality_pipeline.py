import os
from sqlalchemy import create_engine

from loaders.local_csv_loader import load_fields_csv
from transformers.transform_speciality import transform_dim_speciality
from loaders.load_dimensions import load_dim_speciality

DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_dim_speciality_pipeline():
    """ETL pipeline for dim_speciality"""
    print("\n🎓 Starting DIM_SPECIALITY pipeline...\n")
    
    # Extract
    df_raw = load_fields_csv()
    
    # Transform
    df_speciality = transform_dim_speciality(df_raw)
    
    print("\n📘 DIM_SPECIALITY PREVIEW:")
    print(df_speciality.head(20).to_string(index=False))
    
    # Save preview
    df_speciality.to_csv("data/dim_speciality_preview.csv", index=False)
    print("\n💾 Saved preview → data/dim_speciality_preview.csv")
    
    # Load
    load_dim_speciality(df_speciality, engine)
    
    print("\n✅ DIM_SPECIALITY pipeline completed!")


if __name__ == "__main__":
    run_dim_speciality_pipeline()