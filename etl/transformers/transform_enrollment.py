import pandas as pd
import pycountry
import re

def expand_country_name(code_or_name):
    """If input looks like an ISO3 code, convert to full country name"""
    if not isinstance(code_or_name, str):
        return code_or_name
    v = code_or_name.strip()
    
    # If it's 3 letters likely ISO3
    if len(v) == 3 and v.isalpha():
        try:
            c = pycountry.countries.get(alpha_3=v.upper())
            if c:
                return c.name
        except Exception:
            pass
    return v


def remove_fully_null_columns(df):
    """Remove columns that are completely null/empty"""
    if df.empty:
        return df
    null_cols = df.columns[df.isnull().all()].tolist()
    if null_cols:
        print(f"🗑️  Removing fully null columns: {null_cols}")
        df = df.drop(columns=null_cols)
    return df


def transform_dim_field(df_oecd: pd.DataFrame) -> pd.DataFrame:
    """Extract and transform education level dimension from OECD data"""
    print("🔧 Transforming DIM_FIELD...")
    
    # Extract unique education levels
    dim_field = pd.DataFrame(
        df_oecd["Education level"].dropna().unique(), 
        columns=["name"]
    )
    dim_field = dim_field.reset_index(drop=True)
    dim_field["name"] = dim_field["name"].astype(str)
    
    # Add field_id as auto-incremented IDs
    dim_field["field_id"] = [f"F{i:03d}" for i in range(1, len(dim_field) + 1)]
    
    print(f"✅ Transformed {len(dim_field)} education fields")
    return dim_field


def transform_fact_enrollment(df_oecd: pd.DataFrame, dim_field: pd.DataFrame) -> pd.DataFrame:
    """Transform OECD enrollment data into fact table"""
    print("🔧 Transforming FACT_ENROLLMENT...")
    
    # Select and rename columns
    df_enr = df_oecd[[
        "Education level", 
        "Type of educational institution", 
        "TIME_PERIOD", 
        "Reference area", 
        "OBS_VALUE"
    ]].copy()
    
    # Clean data
    df_enr = df_enr.dropna(subset=["OBS_VALUE"])
    df_enr["OBS_VALUE"] = pd.to_numeric(df_enr["OBS_VALUE"], errors="coerce").round(4)
    df_enr = df_enr.dropna(subset=["OBS_VALUE"])
    df_enr["TIME_PERIOD"] = df_enr["TIME_PERIOD"].astype(int)
    
    # Rename columns
    df_enr = df_enr.rename(columns={
        "Education level": "field_name",
        "Type of educational institution": "institution_type",
        "TIME_PERIOD": "year",
        "Reference area": "country_name",
        "OBS_VALUE": "enrollment_percentage"
    })
    
    # Filter invalid percentages
    df_enr = df_enr[
        (df_enr["enrollment_percentage"] != 100) & 
        (df_enr["enrollment_percentage"] != 0)
    ]
    
    # Expand country names (ISO3 → full name)
    df_enr["country_name"] = df_enr["country_name"].apply(expand_country_name)
    
    # Map field_name to field_id
    field_map = dict(zip(dim_field["name"], dim_field["field_id"]))
    df_enr["field_id"] = df_enr["field_name"].map(field_map)
    df_enr = df_enr.drop(columns=["field_name"])
    
    # Remove fully null columns
    df_enr = remove_fully_null_columns(df_enr)
    
    print(f"✅ Transformed {len(df_enr)} enrollment records")
    return df_enr


def transform_fact_graduation(df_grad_m: pd.DataFrame, df_grad_f: pd.DataFrame) -> pd.DataFrame:
    """Transform graduation data by gender into fact table"""
    print("🔧 Transforming FACT_GRADUATION...")
    
    # Add gender labels
    df_grad_f["gender"] = "Female"
    df_grad_m["gender"] = "Male"
    
    # Combine
    fact_graduation = pd.concat([df_grad_m, df_grad_f], ignore_index=True)
    
    # Rename columns
    fact_graduation = fact_graduation.rename(columns={
        "geoUnit": "country_name",
        "value": "percentage"
    })
    
    # Drop unnecessary columns
    for col in ["indicatorId", "magnitude", "qualifier"]:
        if col in fact_graduation.columns:
            fact_graduation = fact_graduation.drop(columns=[col])
    
    # Expand country names
    fact_graduation["country_name"] = fact_graduation["country_name"].apply(expand_country_name)
    
    # Clean percentage
    fact_graduation["percentage"] = pd.to_numeric(
        fact_graduation["percentage"], errors="coerce"
    ).round(4)
    fact_graduation = fact_graduation.dropna(subset=["percentage"])
    
    # Remove fully null columns
    fact_graduation = remove_fully_null_columns(fact_graduation)
    
    print(f"✅ Transformed {len(fact_graduation)} graduation records")
    return fact_graduation


def transform_fact_enrollment_abroad(df_enr_m: pd.DataFrame, df_enr_f: pd.DataFrame) -> pd.DataFrame:
    """Transform enrollment abroad data by gender into fact table"""
    print("🔧 Transforming FACT_ENROLLMENT_ABROAD...")
    
    def prepare_abroad(df, gender):
        df = df.copy()
        df["gender"] = gender
        df = df.rename(columns={
            "geoUnit": "country_name", 
            "value": "percentage"
        })
        
        # Drop unnecessary columns
        for col in ["indicatorId", "magnitude", "qualifier"]:
            if col in df.columns:
                df = df.drop(columns=[col])
        
        # Expand country names
        df["country_name"] = df["country_name"].apply(expand_country_name)
        
        # Clean percentage
        df["percentage"] = pd.to_numeric(df["percentage"], errors="coerce").round(4)
        return df
    
    df_ab_f = prepare_abroad(df_enr_f, "Female")
    df_ab_m = prepare_abroad(df_enr_m, "Male")
    
    # Combine
    fact_enr_abr = pd.concat([df_ab_m, df_ab_f], ignore_index=True)
    fact_enr_abr = fact_enr_abr.dropna(subset=["percentage"])
    
    # Remove fully null columns
    fact_enr_abr = remove_fully_null_columns(fact_enr_abr)
    
    print(f"✅ Transformed {len(fact_enr_abr)} enrollment abroad records")
    return fact_enr_abr