import requests
import pandas as pd
import ast

def extract_countries() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Fetch country data from REST Countries API"""
    print("Fetching country data from REST Countries API...")
    
    url_names = "https://restcountries.com/v3.1/all?fields=name"
    url_codes = "https://restcountries.com/v3.1/all?fields=cca3"
    url_capitals = "https://restcountries.com/v3.1/all?fields=capital"
    
    names = pd.json_normalize(requests.get(url_names).json())
    codes = pd.json_normalize(requests.get(url_codes).json())
    capitals = pd.json_normalize(requests.get(url_capitals).json())
    
    return names, codes, capitals


def extract_capital(x):
    """Extract capital city from nested structure"""
    try:
        if isinstance(x, list) and len(x) > 0:
            return x[0]
        elif isinstance(x, str):
            val = ast.literal_eval(x)
            return val[0] if isinstance(val, list) and len(val) > 0 else None
    except Exception:
        return None
    return None