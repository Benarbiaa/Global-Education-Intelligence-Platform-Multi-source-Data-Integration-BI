import requests
import pandas as pd
import time

def extract_institutions(sample_size=50) -> pd.DataFrame:
    """Fetch institutions from OpenAlex API"""
    print("📡 Fetching institutions from OpenAlex...")
    
    url = "https://api.openalex.org/institutions"
    params = {
        "filter": "works_count:>1000",
        "per-page": sample_size,
        "sort": "works_count:desc"
    }
    
    res = requests.get(url, params=params, timeout=30)
    res.raise_for_status()
    
    rows = []
    results = res.json()["results"]
    
    for inst in results:
        rows.append({
            "institution_id": inst.get("id", "").split("/")[-1],
            "institution_name": inst.get("display_name", ""),
            "country_code_iso2": inst.get("country_code", ""),
            "city": inst.get("geo", {}).get("city", ""),
            "institution_type": inst.get("type", "")
        })
    
    df = pd.DataFrame(rows)
    print(f"✅ Extracted {df.shape[0]} institutions")
    return df


def extract_institution_research(sample_size=50):
    """Extract research metrics per institution from OpenAlex"""
    print("🔬 Extracting research data for institutions...")
    
    institutions_url = "https://api.openalex.org/institutions"
    params = {
        "filter": "works_count:>1000",
        "per-page": sample_size,
        "sort": "works_count:desc"
    }
    
    try:
        response = requests.get(institutions_url, params=params, timeout=30)
        response.raise_for_status()
        institutions_data = response.json()
        
        institutions = institutions_data["results"]
        print(f"📍 Retrieved {len(institutions)} institutions from OpenAlex")
        
        research_rows = []
        print("📊 Fetching research works for institutions...")
        
        for inst in institutions[:20]:
            inst_id = inst.get("id", "").split("/")[-1]
            
            works_url = "https://api.openalex.org/works"
            works_params = {
                "filter": f"institutions.id:{inst['id']}",
                "per-page": 5,
                "sort": "cited_by_count:desc"
            }
            
            try:
                works_res = requests.get(works_url, params=works_params, timeout=30)
                works_res.raise_for_status()
                works_data = works_res.json()
                
                for work in works_data.get("results", []):
                    research_rows.append({
                        "institution_id": inst_id,
                        "total_citations": work.get("cited_by_count", 0),
                        "international_collaboration": len(work.get("authorships", [])) 
                            if work.get("authorships") else 0,
                        "top_paper_title": work.get("title", "")[:200],
                        "top_paper_doi": work.get("doi", "")
                    })
                
                time.sleep(0.1)
            
            except Exception as e:
                print(f"⚠️ Could not fetch works for {inst.get('display_name')}: {e}")
        
        research_df = pd.DataFrame(research_rows)
        print(f"📊 Extracted {len(research_df)} research rows")
        return research_df
    
    except Exception as e:
        print(f"❌ Extraction failed: {e}")
        return pd.DataFrame()