import requests
import pandas as pd

def extract_worldbank_rd_investment(country_code='all'):
    """Extract R&D investment data from World Bank API"""
    print("\n💰 Extracting R&D investment data from World Bank API...")
    
    url = "https://api.worldbank.org/v2/country"
    url += "/all" if country_code == 'all' else f"/{country_code}"
    url += "/indicator/GB.XPD.RSDV.GD.ZS?format=json&per_page=20000"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        if len(data) < 2:
            print("❌ No data received from World Bank API")
            return pd.DataFrame()
        
        investment_data = [
            {
                'investment_id': f"{item['country']['id']}_{item['date']}",
                'wb_country_code': item['country']['id'],
                'year': int(item['date']),
                'rd_expenditure_gdp_percent': round(item['value'], 3)
            }
            for item in data[1] if item.get('value') is not None
        ]
        
        df = pd.DataFrame(investment_data)
        print(f"✅ Extracted {len(df)} R&D investment records")
        return df
    
    except Exception as e:
        print(f"❌ Error extracting World Bank data: {e}")
        return pd.DataFrame()