import pandas as pd
import re
import unicodedata
from difflib import SequenceMatcher

def transform_student_staff_ratio(df: pd.DataFrame, engine) -> pd.DataFrame:
    """Transform OECD student-staff ratio data"""
    # Pivot countries x years
    pivoted_df = df.pivot_table(
        index='REF_AREA',
        columns='TIME_PERIOD',
        values='OBS_VALUE',
        aggfunc='first'
    ).reset_index()
    
    # Identify year columns
    year_columns = [col for col in pivoted_df.columns if col not in ['REF_AREA'] and str(col).isdigit()]
    
    # Melt to long format
    melted_df = pivoted_df.melt(
        id_vars=['REF_AREA'],
        value_vars=year_columns,
        var_name='year',
        value_name='students_per_staff'
    )
    
    # Map country_id
    dim_countries = pd.read_sql("SELECT country_id, country_code FROM dim_countries", engine)
    melted_df = melted_df.merge(
        dim_countries,
        left_on='REF_AREA',
        right_on='country_code',
        how='left'
    )
    
    # Drop missing country_id and students_per_staff
    melted_df = melted_df.dropna(subset=['country_id', 'students_per_staff'])
    
    # Add primary key
    melted_df = melted_df.reset_index(drop=True)
    melted_df['ratio_id'] = melted_df.index + 1
    
    # Keep only relevant columns
    fact_ratio_df = melted_df[['ratio_id', 'country_id', 'year', 'students_per_staff']]
    
    print(f"✅ Transformed {len(fact_ratio_df)} student-staff ratio records")
    return fact_ratio_df


def transform_tertiary_graduates(pivoted_df: pd.DataFrame, engine) -> pd.DataFrame:
    """Transform graduates by field data"""
    print("Transforming tertiary graduates data...")
    
    # Load dimensions
    dim_countries = pd.read_sql("SELECT country_id, country_code FROM dim_countries", engine)
    dim_speciality = pd.read_sql("SELECT speciality_id, field_code FROM dim_speciality", engine)
    
    # Melt pivoted table
    fields_to_keep = [col for col in pivoted_df.columns if col in dim_speciality['field_code'].values]
    melted_df = pivoted_df.melt(
        id_vars=["REF_AREA"],
        value_vars=fields_to_keep,
        var_name="field_code",
        value_name="graduate_percent"
    )
    
    # Map country_id
    melted_df = melted_df.merge(dim_countries, left_on="REF_AREA", right_on="country_code", how="left")
    
    # Map speciality_id
    melted_df = melted_df.merge(dim_speciality, on="field_code", how="left")
    
    # Drop rows with missing foreign keys
    melted_df = melted_df.dropna(subset=['country_id', 'speciality_id'])
    
    # Add graduate_id and year
    melted_df = melted_df.reset_index(drop=True)
    melted_df["graduate_id"] = melted_df.index + 1
    melted_df["year"] = 2022
    
    # Keep only relevant columns
    fact_df = melted_df[["graduate_id", "country_id", "speciality_id", "graduate_percent", "year"]]
    
    print(f"✅ Transformed {len(fact_df)} graduate records")
    return fact_df


# Country matching helpers for university rankings
def normalize_country(name: str) -> str:
    if pd.isna(name):
        return ""
    name = str(name).strip().lower()
    name = unicodedata.normalize("NFKD", name).encode("ASCII", "ignore").decode()
    name = re.sub(r"\([^)]*\)", "", name)
    name = re.sub(r"[^\w\s]", " ", name)
    name = re.sub(r"^(the|a|an)\s+", "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def extract_core_name(name: str) -> str:
    name = normalize_country(name)
    suffixes = [
        r"\brepublic\b", r"\bfederation\b", r"\bkingdom\b",
        r"\bemirate\b", r"\bemirates\b", r"\bprincipality\b",
        r"\bstate\b", r"\bcommonwealth\b", r"\bunion\b",
        r"\bterritory\b", r"\bislands?\b",
        r"\bdemocratic\b", r"\bpeoples\b", r"\bsocialist\b",
        r"\bfederal\b", r"\bislamic\b", r"\barab\b",
    ]
    for s in suffixes:
        name = re.sub(s, "", name)
    name = re.sub(r"\bof\s+.*$", "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def fuzzy_score(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def find_country_match(raw_name: str, df_dim: pd.DataFrame, threshold=0.70):
    if pd.isna(raw_name):
        return None, None, None
    norm = normalize_country(raw_name)
    core = extract_core_name(raw_name)
    df_dim_norm = df_dim.copy()
    df_dim_norm["norm"] = df_dim_norm["country_name"].apply(normalize_country)
    df_dim_norm["core"] = df_dim_norm["country_name"].apply(extract_core_name)
    
    # Try exact match
    row = df_dim_norm[df_dim_norm["norm"] == norm]
    if not row.empty:
        r = row.iloc[0]
        return r["id"], r["country_name"], "exact"
    
    # Try core match
    row = df_dim_norm[df_dim_norm["core"] == core]
    if not row.empty and core != "":
        r = row.iloc[0]
        return r["id"], r["country_name"], "core_exact"
    
    # Try substring
    for _, r in df_dim_norm.iterrows():
        if core in r["norm"] or r["norm"] in core:
            if len(core) > 3:
                return r["id"], r["country_name"], "substring"
    
    # Try fuzzy match
    best = None
    best_score = 0
    for _, r in df_dim_norm.iterrows():
        s = max(fuzzy_score(norm, r["norm"]), fuzzy_score(core, r["core"]))
        if s > best_score:
            best_score = s
            best = r
    
    if best is not None and best_score >= threshold:
        return best["id"], best["country_name"], f"fuzzy_{best_score:.2f}"
    
    return None, None, None


def clean_qs_rank(rank):
    """Clean QS ranking values"""
    if pd.isna(rank):
        return None
    rank = str(rank).strip()
    rank = re.sub(r"^[^\d]+", "", rank)
    if "-" in rank:
        rank = rank.split("-")[0]
    return int(rank) if rank.isdigit() else None


def transform_university_ranking(df_ranking: pd.DataFrame, engine) -> pd.DataFrame:
    """Transform university ranking data with country matching"""
    print("Transforming university ranking data...")
    
    # Rename columns
    df_ranking = df_ranking.rename(columns={
        "Rank": "qs_rank",
        "Name": "university_name",
        "Country/Territory": "country_name",
        "Overall SCORE": "overall_score"
    })[["qs_rank", "university_name", "country_name", "overall_score"]]
    
    # Clean QS rank
    df_ranking["qs_rank"] = df_ranking["qs_rank"].apply(clean_qs_rank)
    df_ranking = df_ranking.dropna(subset=["qs_rank"])
    
    # Clean overall score
    df_ranking["overall_score"] = pd.to_numeric(df_ranking["overall_score"], errors="coerce")
    
    # Load dim_countries
    df_country = pd.read_sql("SELECT country_id AS id, country_name FROM dim_countries", engine)
    
    # Map countries
    mapped = []
    for _, row in df_ranking.iterrows():
        cid, cname, method = find_country_match(row["country_name"], df_country)
        mapped.append({"country_id": cid})
    
    df_ranking["country_id"] = [m["country_id"] for m in mapped]
    df_ranking["year"] = 2024
    
    # Prepare fact table
    df_fact = df_ranking[["university_name", "qs_rank", "overall_score", "country_id", "year"]].copy()
    df_fact["university_ranking_id"] = df_fact.index + 1
    df_fact = df_fact.dropna(subset=["qs_rank", "overall_score", "country_id"])
    df_fact = df_fact[["university_ranking_id", "university_name", "qs_rank", "overall_score", "country_id", "year"]]
    
    print(f"✅ Transformed {len(df_fact)} university rankings")
    return df_fact