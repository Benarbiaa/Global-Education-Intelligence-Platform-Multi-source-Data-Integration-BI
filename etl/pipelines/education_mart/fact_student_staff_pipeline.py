import os
from sqlalchemy import create_engine

from sources.api_oecd import extract_student_staff_ratio
from transformers.transform_education import transform_student_staff_ratio
from loaders.load_facts import load_fact_student_staff_ratio

DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_student_staff_pipeline():
    """ETL pipeline for fact_student_staff_ratio"""
    print("\n👥 Starting FACT_STUDENT_STAFF_RATIO pipeline...")
    
    # Extract
    df_extracted = extract_student_staff_ratio()
    
    # Transform
    fact_df = transform_student_staff_ratio(df_extracted, engine)
    
    print("\n📘 FACT_STUDENT_STAFF_RATIO preview:")
    print(fact_df.head(20).to_string(index=False))
    
    # Save preview
    fact_df.to_csv("data/fact_student_staff_ratio_preview.csv", index=False)
    print("\n💾 Saved preview → data/fact_student_staff_ratio_preview.csv")
    
    # Load
    load_fact_student_staff_ratio(fact_df, engine)
    
    print("\n✅ FACT_STUDENT_STAFF_RATIO pipeline completed!")


if __name__ == "__main__":
    run_student_staff_pipeline()