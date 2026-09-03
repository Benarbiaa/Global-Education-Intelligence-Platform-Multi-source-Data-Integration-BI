import os
from sqlalchemy import create_engine

from sources.api_openalex import extract_institution_research
from transformers.transform_institutions import transform_fact_institution_research
from loaders.load_facts import load_fact_institution_research

# Database connection
DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_research_pipeline():
    """Full ETL pipeline for fact_institution_research"""
    print("\n Starting FACT_INSTITUTION_RESEARCH pipeline...")
    
    # Extract
    raw_df = extract_institution_research(sample_size=50)
    
    # Transform
    fact_df = transform_fact_institution_research(raw_df)
    
    print("\n📘 FACT_INSTITUTION_RESEARCH preview:")
    print(fact_df.head(15).to_string(index=False))
    
    # Save preview
    fact_df.to_csv("data/fact_institution_research_preview.csv", index=False)
    print("\n💾 Saved preview → data/fact_institution_research_preview.csv")
    
    # Load
    load_fact_institution_research(fact_df, engine)
    
    print("\n✅ FACT_INSTITUTION_RESEARCH pipeline completed!")


if __name__ == "__main__":
    run_research_pipeline()