import pandas as pd
import re

def transform_dim_speciality(df_raw: pd.DataFrame) -> pd.DataFrame:
    """Clean speciality names and extract field codes"""
    print("Transforming speciality data...")
    
    # Take all columns from the first field column to the second last
    field_columns = list(df_raw.columns[2:-1])
    
    cleaned_names = []
    field_codes = []
    
    for col in field_columns:
        col_str = str(col)
        
        # Extract the code in parentheses at the start, e.g., (F00)
        match = re.match(r'\((.*?)\)', col_str)
        code = match.group(1) if match else None
        field_codes.append(code)
        
        # Remove leading code and parentheses
        name = re.sub(r'^\(.*?\)\s*', '', col_str)
        # Remove trailing parentheses
        name = re.sub(r'\s*\(.*?\)', '', name)
        # Remove surrounding quotes
        name = name.strip().strip('"').strip("'")
        # Normalize spaces
        name = re.sub(r'\s+', ' ', name).strip()
        
        cleaned_names.append(name)
    
    # Build DataFrame
    df = pd.DataFrame({
        "speciality_name": cleaned_names,
        "field_code": field_codes
    })
    
    # Remove first row and last row (metadata)
    df = df.iloc[1:-1].reset_index(drop=True)
    
    # Add auto-increment ID
    df.insert(0, "speciality_id", range(1, len(df) + 1))
    
    print(f"✅ Transformed {len(df)} specialities")
    return df