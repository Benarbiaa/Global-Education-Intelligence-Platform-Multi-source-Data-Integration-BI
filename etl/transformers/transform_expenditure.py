import pandas as pd
from functools import reduce
from .transform_enrollment import expand_country_name, remove_fully_null_columns


def transform_fact_government_expenditure(dfs_expenditure: dict) -> pd.DataFrame:
    """Transform government expenditure data from multiple sources"""
    print("🔧 Transforming FACT_GOVERNMENT_EXPENDITURE...")
    
    # Pivot each dataframe
    transformed = {}
    for name, df in dfs_expenditure.items():
        pivot = df.pivot_table(
            index=["geoUnit", "year"], 
            columns="indicatorId", 
            values="value"
        ).reset_index()
        transformed[name] = pivot
    
    # Merge all pivoted dataframes
    merged = reduce(
        lambda left, right: pd.merge(left, right, on=["geoUnit", "year"], how="outer"), 
        transformed.values()
    )
    
    # Rename columns to meaningful names
    rename_map = {
        'XGDP.FSGOV': 'expenditure_percentage',
        'ODAFLOW.VOLUMESCHOLARSHIP': 'scholarships',
        'XSPENDP.5T8.FDPUB.FNCUR': 'tertiary_expenditure'
    }
    merged.rename(columns=rename_map, inplace=True)
    
    # Keep only required columns
    required_cols = ['geoUnit', 'year', 'expenditure_percentage', 'scholarships', 'tertiary_expenditure']
    merged = merged[[c for c in required_cols if c in merged.columns]]
    
    # Convert to numeric
    merged['scholarships'] = pd.to_numeric(merged.get('scholarships'), errors='coerce')
    merged['expenditure_percentage'] = pd.to_numeric(merged.get('expenditure_percentage'), errors='coerce')
    merged['tertiary_expenditure'] = pd.to_numeric(merged.get('tertiary_expenditure'), errors='coerce')
    
    # Expand country names
    merged['country_name'] = merged['geoUnit'].astype(str).apply(expand_country_name)
    
    # Drop rows where all numeric columns are null
    merged = merged.dropna(subset=['scholarships', 'tertiary_expenditure'], how='all')
    
    # Remove fully null columns
    merged = remove_fully_null_columns(merged)
    
    print(f"✅ Transformed {len(merged)} government expenditure records")
    return merged