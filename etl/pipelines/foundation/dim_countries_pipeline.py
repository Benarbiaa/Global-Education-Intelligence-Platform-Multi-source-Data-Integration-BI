import os
from sqlalchemy import create_engine

from sources.api_restcountries import extract_countries
from loaders.local_csv_loader import load_population_csvs
from transformers.transform_countries import transform_dim_countries
from loaders.load_dimensions import load_dim_countries

DB_URL = os.getenv('DATABASE_URL', 'postgresql://localhost/neondb')
engine = create_engine(DB_URL)
os.makedirs("data", exist_ok=True)


def run_dim_countries_pipeline():
    """ETL pipeline for dim_countries"""
    print("\n🌍 Starting DIM_COUNTRIES pipeline...\n")
    
    # Extract
    names, codes, capitals = extract_countries()
    rural_pop, urban_pop = load_population_csvs(
        "data/raw/API_SP.RUR.TOTL.ZS_DS2_en_csv_v2_127107.csv",
        "data/raw/API_SP.URB.TOTL.IN.ZS_DS2_en_csv_v2_129596.csv"
    )
    
    # Transform
    df_country = transform_dim_countries(names, codes, capitals, rural_pop, urban_pop)
    
    print("\n📘 DIM_COUNTRIES PREVIEW:")
    print(df_country.head(20).to_string(index=False))
    
    # Save preview
    df_country.to_csv("data/dim_countries_preview.csv", index=False)
    print("\n💾 Saved preview → data/dim_countries_preview.csv")
    
    # Load
    load_dim_countries(df_country, engine)
    
    print("\n✅ DIM_COUNTRIES pipeline completed!")


if __name__ == "__main__":
    run_dim_countries_pipeline()