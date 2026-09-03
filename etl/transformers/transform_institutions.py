import pandas as pd
import pycountry
import os

os.makedirs("data", exist_ok=True)

def iso2_to_iso3(code):
    """Convert ISO-2 country code (e.g. US → USA, JP → JPN)"""
    if pd.isna(code) or code == "":
        return None
    try:
        return pycountry.countries.get(alpha_2=code.upper()).alpha_3
    except:
        return None


def transform_dim_institution(df: pd.DataFrame, engine) -> pd.DataFrame:
    """Transform raw institution data into dim_institution format"""
    
    # ISO-2 → ISO-3 conversion
    df["country_code"] = df["country_code_iso2"].apply(iso2_to_iso3)
    
    # Load dim_countries
    dim_countries = pd.read_sql(
        "SELECT country_id, country_code, LOWER(capital_city) AS capital_city "
        "FROM dim_countries",
        engine
    )
    
    # Merge using ISO-3 country_code
    merged = df.merge(
        dim_countries,
        left_on="country_code",
        right_on="country_code",
        how="left"
    )
    
    # Compute is_capital_city
    merged["is_capital_city"] = merged.apply(
        lambda row: True
        if row["city"] and str(row["city"]).lower() == str(row["capital_city"]).lower()
        else False,
        axis=1
    )
    
    # Final dataframe
    dim_institution = merged[[
        "institution_id",
        "institution_name",
        "country_id",
        "institution_type",
        "city",
        "is_capital_city"
    ]]
    
    # Debug CSVs
    missing_country = merged[merged["country_id"].isna()][[
        "institution_id",
        "institution_name",
        "country_code_iso2",
        "country_code"
    ]]
    missing_country.to_csv("data/missing_institution_countries.csv", index=False)
    
    missing_city = merged[(merged["city"].isna()) | (merged["city"] == "")][[
        "institution_id",
        "institution_name",
        "country_code"
    ]]
    missing_city.to_csv("data/institutions_missing_city.csv", index=False)
    
    print(f"⚠️ Missing country mappings: {len(missing_country)} saved → data/missing_institution_countries.csv")
    print(f"⚠️ Missing city entries: {len(missing_city)} saved → data/institutions_missing_city.csv")
    
    return dim_institution


def transform_fact_institution_research(df: pd.DataFrame) -> pd.DataFrame:
    """Transform raw research data into fact table format"""
    print("🔧 Transforming FACT_INSTITUTION_RESEARCH...")
    
    if df.empty:
        print("⚠️ Empty dataframe given. Nothing to transform.")
        return df
    
    df = df.copy()
    df.insert(0, "research_id", range(1, len(df) + 1))
    
    print(f"✅ Assigned research_id 1 → {len(df)}")
    return df