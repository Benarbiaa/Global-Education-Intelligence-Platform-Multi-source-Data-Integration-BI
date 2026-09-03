import os
from sqlalchemy import create_engine

from sources.api_worldbank import extract_worldbank_rd_investment
from transformers.transform_investment import transform_worldbank_investment_db
from loaders.load_facts import load_fact_research_investment

# Database connection
DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_investment_pipeline():
    """Full ETL pipeline for fact_research_investment"""
    print("\n🚀 Starting FACT_RESEARCH_INVESTMENT pipeline...")
    
    # Extract
    wb_df = extract_worldbank_rd_investment("all")
    
    # Transform
    mapped_df = transform_worldbank_investment_db(wb_df, engine)
    
    # Load
    load_fact_research_investment(mapped_df, engine)
    
    # Preview
    print("\n📘 FACT_RESEARCH_INVESTMENT preview:")
    print(mapped_df.head(20).to_string(index=False))
    
    print("\n✅ FACT_RESEARCH_INVESTMENT pipeline completed!")


if __name__ == "__main__":
    run_investment_pipeline()