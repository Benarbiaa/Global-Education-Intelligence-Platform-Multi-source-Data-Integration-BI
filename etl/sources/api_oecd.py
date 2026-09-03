import requests
import pandas as pd
from io import StringIO

def extract_student_staff_ratio() -> pd.DataFrame:
    """Extract student-teacher ratio from OECD API"""
    url = (
        "https://sdmx.oecd.org/public/rest/data/"
        "OECD.EDU.IMEP,DSD_EAG_UOE_NON_FIN_PERS@DF_UOE_NF_PERS_STR,1.0/"
        ".ISCED11_5T8......A...INST_EDU..._T.?dimensionAtObservation=AllDimensions&format=csv"
    )
    print("📊 Fetching student-teacher ratio data for tertiary education...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    df = pd.read_csv(StringIO(response.text))
    print(f"✅ Data fetched successfully! Original shape: {df.shape}")
    return df