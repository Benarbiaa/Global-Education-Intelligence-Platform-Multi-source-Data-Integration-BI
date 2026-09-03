import os
from sqlalchemy import create_engine

from sources.api_openalex import extract_institutions
from transformers.transform_institutions import transform_dim_institution
from loaders.load_dimensions import load_dim_institution

# Database connection
DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_institution_pipeline():
    """Full ETL pipeline for dim_institution"""
    print("\n🚀 Starting DIM_INSTITUTION pipeline...\n")
    
    # Extract
    df_raw = extract_institutions()
    
    # Transform
    dim_institution_df = transform_dim_institution(df_raw, engine)
    
    print("\n📘 DIM_INSTITUTION PREVIEW:")
    print(dim_institution_df.head(20).to_string(index=False))
    
    # Save preview
    dim_institution_df.to_csv("data/dim_institution_preview.csv", index=False)
    print("\n💾 Saved preview → data/dim_institution_preview.csv")
    
    # Load
    load_dim_institution(dim_institution_df, engine)
    
    print("\n✅ DIM_INSTITUTION pipeline completed!")


if __name__ == "__main__":
    run_institution_pipeline()