import pandas as pd
import pycountry
import re


def iso2_to_iso3(code):
    """Return ISO3 for an ISO2 code, or None"""
    if not isinstance(code, str) or code == "":
        return None
    try:
        c = pycountry.countries.get(alpha_2=code.upper())
        return c.alpha_3 if c else None
    except Exception:
        return None


def normalize_name(n):
    """Normalize names for robust matching (lowercase, strip, ascii)"""
    if pd.isna(n):
        return ""
    s = str(n).strip().lower()
    # Remove punctuation
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def build_dim_countries_lookup(engine):
    """Load dim_countries and build helper structures for mapping"""
    df = pd.read_sql("SELECT country_id, country_name, country_code FROM dim_countries", engine)
    # Normalize
    df['name_norm'] = df['country_name'].astype(str).str.strip().str.lower()
    df['country_code_norm'] = df['country_code'].astype(str).str.upper().where(df['country_code'].notna(), None)
    return df


def map_country_name_to_id(country_value, dim_countries_df):
    """Robust country mapping using multiple strategies"""
    if pd.isna(country_value):
        return None

    v = str(country_value).strip()
    if v == "":
        return None

    # 1) If appears ISO3 (3 letters), expand to canonical name then try match
    if len(v) == 3 and v.isalpha():
        try:
            c = pycountry.countries.get(alpha_3=v.upper())
            if c:
                candidate_name = c.name
                candidate_norm = candidate_name.strip().lower()
                match = dim_countries_df[dim_countries_df['name_norm'] == candidate_norm]
                if not match.empty:
                    return match.iloc[0]['country_id']
        except Exception:
            pass

    # 2) If appears ISO2 (2 letters), convert to ISO3 and try match on country_code
    if len(v) == 2 and v.isalpha():
        try:
            iso3 = iso2_to_iso3(v)
            if iso3:
                match = dim_countries_df[dim_countries_df['country_code_norm'] == iso3.upper()]
                if not match.empty:
                    return match.iloc[0]['country_id']
        except Exception:
            pass

    # 3) Exact normalized name match
    name_norm = normalize_name(v)
    match = dim_countries_df[dim_countries_df['name_norm'] == name_norm]
    if not match.empty:
        return match.iloc[0]['country_id']

    # 4) Substring match (contains)
    contains = dim_countries_df[dim_countries_df['name_norm'].str.contains(re.escape(name_norm), na=False)]
    if not contains.empty:
        return contains.iloc[0]['country_id']

    # 5) Last resort: try splitting off parts
    parts = re.split(r",|\(|\-| of ", v)
    for p in parts:
        p = p.strip()
        if len(p) < 3:
            continue
        pn = normalize_name(p)
        m2 = dim_countries_df[dim_countries_df['name_norm'] == pn]
        if not m2.empty:
            return m2.iloc[0]['country_id']

    return None


def apply_country_mapping(df: pd.DataFrame, engine, country_col='country_name') -> pd.DataFrame:
    """Apply country mapping to a dataframe and clean up"""
    dim_countries = build_dim_countries_lookup(engine)
    
    df = df.copy()
    df['country_id'] = df[country_col].apply(lambda x: map_country_name_to_id(x, dim_countries))
    
    # Remove rows with no country_id
    before_count = len(df)
    df = df.dropna(subset=['country_id'])
    after_count = len(df)
    
    if before_count != after_count:
        print(f"🗑️  Removed {before_count - after_count} rows with no country_id mapping")
    
    # Remove country_name column (redundancy)
    if country_col in df.columns:
        df = df.drop(columns=[country_col])
    
    # Remove geoUnit column if present
    if 'geoUnit' in df.columns:
        df = df.drop(columns=['geoUnit'])
    
    return df