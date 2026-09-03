import os
from sqlalchemy import create_engine

from loaders.local_csv_loader import load_university_ranking_excel
from transformers.transform_education import transform_university_ranking
from loaders.load_facts import load_fact_university_ranking

DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_university_ranking_pipeline():
    """ETL pipeline for fact_university_ranking"""
    print("\n🏆 Starting FACT_UNIVERSITY_RANKING pipeline...")
    
    # Extract
    df_ranking = load_university_ranking_excel()
    
    # Transform
    fact_df = transform_university_ranking(df_ranking, engine)
    
    print("\n📘 FACT_UNIVERSITY_RANKING preview:")
    print(fact_df.head(20).to_string(index=False))
    
    # Save preview
    fact_df.to_csv("data/fact_university_ranking_preview.csv", index=False)
    print("\n💾 Saved preview → data/fact_university_ranking_preview.csv")
    
    # Load
    load_fact_university_ranking(fact_df, engine)
    
    print("\n✅ FACT_UNIVERSITY_RANKING pipeline completed!")


if __name__ == "__main__":
    run_university_ranking_pipeline()