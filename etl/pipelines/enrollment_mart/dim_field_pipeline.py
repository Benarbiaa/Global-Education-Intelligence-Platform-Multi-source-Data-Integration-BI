import os
from sqlalchemy import create_engine

from loaders.local_csv_loader import load_enrollment_oecd
from transformers.transform_enrollment import transform_dim_field
from loaders.load_dimensions import load_dim_field

DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_dim_field_pipeline():
    """ETL pipeline for dim_field (education levels)"""
    print("\n📚 Starting DIM_FIELD pipeline...\n")
    
    # Extract
    df_oecd = load_enrollment_oecd()
    
    # Transform
    dim_field = transform_dim_field(df_oecd)
    
    print("\n📘 DIM_FIELD PREVIEW:")
    print(dim_field.head(20).to_string(index=False))
    
    # Save preview
    dim_field.to_csv("data/dim_field_preview.csv", index=False)
    print("\n💾 Saved preview → data/dim_field_preview.csv")
    
    # Load
    load_dim_field(dim_field, engine)
    
    print("\n✅ DIM_FIELD pipeline completed!")


if __name__ == "__main__":
    run_dim_field_pipeline()