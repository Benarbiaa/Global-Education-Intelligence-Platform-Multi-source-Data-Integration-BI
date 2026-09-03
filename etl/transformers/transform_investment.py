import pandas as pd
import pycountry

def wb_iso2_to_iso3(code):
    """Convert World Bank ISO-2 codes to ISO-3"""
    if pd.isna(code) or code == '':
        return None
    try:
        return pycountry.countries.get(alpha_2=code.upper()).alpha_3
    except:
        return None


def transform_worldbank_investment_db(worldbank_df, engine):
    """Map World Bank R&D investment to dim_countries"""
    print("\n🔄 Transform: Mapping World Bank R&D investment to dim_countries")
    
    dim_country = pd.read_sql("SELECT country_id, country_code FROM dim_countries", engine)
    dim_country.columns = dim_country.columns.str.lower()
    dim_country['country_code'] = dim_country['country_code'].str.upper()
    
    # Convert WB ISO-2 → ISO-3
    worldbank_df['country_code'] = worldbank_df['wb_country_code'].apply(wb_iso2_to_iso3)
    
    # Merge
    merged = worldbank_df.merge(
        dim_country[['country_id', 'country_code']],
        on='country_code',
        how='left',
        indicator=True
    )
    
    # Save unmatched codes
    unmatched = merged[merged['_merge'] == 'left_only']['wb_country_code'].unique()
    if len(unmatched) > 0:
        print(f"❗ Unmatched World Bank codes: {len(unmatched)}")
        print("🔍 Example unmatched codes:", unmatched[:15])
        pd.DataFrame({"unmatched_codes": unmatched}).to_csv(
            "data/unmatched_country_codes_worldbank.csv", index=False
        )
    
    mapped_df = merged[merged['_merge'] == 'both'].drop(columns=['_merge', 'country_code', 'wb_country_code'])
    print(f"✅ Mapped {len(mapped_df)} investment records")
    print(f"❌ Dropped {len(worldbank_df) - len(mapped_df)} unmatched records")
    return mapped_df