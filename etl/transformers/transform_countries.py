import pandas as pd
from sources.api_restcountries import extract_capital

def transform_dim_countries(names, codes, capitals, rural_pop, urban_pop) -> pd.DataFrame:
    """Transform raw country data into dimension table"""
    print("Transforming country data...")
    
    # Clean names
    names = names[["name.common"]]
    
    # Clean capitals
    capitals["capital"] = capitals["capital"].apply(extract_capital)
    
    # Combine API data
    df_country = pd.concat([names, codes, capitals], axis=1)
    
    # Get latest year dynamically
    latest_year_rural = [c for c in rural_pop.columns if c.isdigit()][-1]
    latest_year_urban = [c for c in urban_pop.columns if c.isdigit()][-1]
    
    rural_pop = rural_pop[["Country Code", latest_year_rural]].set_index("Country Code")
    urban_pop = urban_pop[["Country Code", latest_year_urban]].set_index("Country Code")
    
    # Keep only countries present in both datasets
    df_country = df_country[
        df_country["cca3"].isin(rural_pop.index) & df_country["cca3"].isin(urban_pop.index)
    ]
    
    # Map population percentages
    df_country["rural_population_percent"] = df_country["cca3"].map(rural_pop[latest_year_rural])
    df_country["urban_population_percent"] = df_country["cca3"].map(urban_pop[latest_year_urban])
    
    # Drop nulls and rename columns
    df_country.dropna(inplace=True)
    df_country.rename(
        columns={
            "name.common": "country_name",
            "cca3": "country_code",
            "capital": "capital_city"
        },
        inplace=True
    )
    
    # Add auto-increment country_id
    df_country.reset_index(drop=True, inplace=True)
    df_country["country_id"] = df_country.index + 1
    
    return df_country