import pandas as pd

def load_population_csvs(rural_path, urban_path):
    """Load World Bank population CSVs"""
    print("Reading local CSV data...")
    rural_pop = pd.read_csv(rural_path, skiprows=4)
    urban_pop = pd.read_csv(urban_path, skiprows=4)
    return rural_pop, urban_pop


def load_fields_csv(path="data/raw/fields.csv"):
    """Load speciality fields CSV"""
    print(f"Loading fields from {path}...")
    fields = pd.read_csv(path, skiprows=7)
    return fields


def load_graduates_csv(path="data/raw/education_graduates_by_field_2022.csv"):
    """Load pivoted graduates CSV"""
    print(f"Loading graduates data from {path}...")
    return pd.read_csv(path)


def load_university_ranking_excel(path="data/raw/university_ranking.xlsx"):
    """Load QS university ranking data"""
    print(f"Loading university rankings from {path}...")
    return pd.read_excel(path, skiprows=2)
def load_enrollment_oecd(path="data/raw/OECD.csv"):
    """Load OECD enrollment data"""
    print(f"Loading OECD enrollment from {path}...")
    df = pd.read_csv(path, low_memory=False)
    # Filter out invalid entries
    df = df[df["Reference area"].str.lower() != "isreal"]
    return df


def load_graduation_data(male_path="data/raw/fact_grad_M.csv", female_path="data/raw/fact_gread_F.csv"):
    """Load graduation data by gender"""
    print(f"Loading graduation data...")
    df_grad_m = pd.read_csv(male_path, low_memory=False)
    df_grad_f = pd.read_csv(female_path, low_memory=False)
    
    # Filter invalid entries
    df_grad_m = df_grad_m[df_grad_m["geoUnit"].str.lower() != "isreal"]
    df_grad_f = df_grad_f[df_grad_f["geoUnit"].str.lower() != "isreal"]
    
    return df_grad_m, df_grad_f


def load_enrollment_abroad_data(male_path="data/raw/fact_enr_abr_M.csv", female_path="data/raw/fact_enr_abr_F.csv"):
    """Load enrollment abroad data by gender"""
    print(f"Loading enrollment abroad data...")
    df_enr_m = pd.read_csv(male_path, low_memory=False)
    df_enr_f = pd.read_csv(female_path, low_memory=False)
    
    # Filter invalid entries
    df_enr_m = df_enr_m[df_enr_m["geoUnit"].str.lower() != "isreal"]
    df_enr_f = df_enr_f[df_enr_f["geoUnit"].str.lower() != "isreal"]
    
    return df_enr_m, df_enr_f


def load_expenditure_data(data_path="data/raw/data.csv", 
                          odaflow_path="data/raw/ODAFLOW_XGDP.csv",
                          xgov_path="data/raw/XGOVEXP_XSPENDP.csv"):
    """Load government expenditure data files"""
    print(f"Loading expenditure data...")
    dfs = {
        "data": pd.read_csv(data_path, low_memory=False),
        "odaflow": pd.read_csv(odaflow_path, low_memory=False),
        "xgov": pd.read_csv(xgov_path, low_memory=False)
    }
    return dfs