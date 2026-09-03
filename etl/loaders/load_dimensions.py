from sqlalchemy import text

def load_dim_countries(df, engine, table_name="dim_countries"):
    """Load country dimension table"""
    print(f"Preparing to load {len(df)} rows into '{table_name}'")
    
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
        
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                country_id BIGINT PRIMARY KEY,
                country_name TEXT NOT NULL,
                country_code TEXT NOT NULL,
                capital_city TEXT,
                rural_population_percent DOUBLE PRECISION,
                urban_population_percent DOUBLE PRECISION
            )
        """))
        
        df.to_sql(table_name, conn, if_exists="append", index=False)
    
    print(f"✅ Successfully loaded {len(df)} rows into '{table_name}'")


def load_dim_speciality(df, engine, table_name="dim_speciality"):
    """Load speciality dimension table"""
    print(f"Preparing to load {len(df)} rows into '{table_name}'")
    
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
        
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                speciality_id SERIAL PRIMARY KEY,
                speciality_name TEXT NOT NULL,
                field_code TEXT
            )
        """))
        
        df.to_sql(table_name, conn, if_exists="append", index=False)
    
    print(f"✅ Successfully loaded {len(df)} rows into '{table_name}'")


def load_dim_institution(dim_df, engine):
    """Load institution dimension table"""
    print("\n🚀 Loading data into 'dim_institution'...")
    
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS dim_institution CASCADE"))
        
        conn.execute(text("""
            CREATE TABLE dim_institution (
                institution_id TEXT PRIMARY KEY,
                institution_name TEXT,
                country_id BIGINT,
                institution_type TEXT,
                city TEXT,
                is_capital_city BOOLEAN,
                FOREIGN KEY (country_id) REFERENCES dim_countries(country_id)
            )
        """))
        
        dim_df.to_sql("dim_institution", conn, if_exists="append", index=False)
    
    print("✅ Data successfully loaded into 'dim_institution'")
def load_dim_field(df, engine, table_name="dim_field"):
    """Load field dimension table (education levels)"""
    print(f"Preparing to load {len(df)} rows into '{table_name}'")
    
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
        
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                field_id VARCHAR(10) PRIMARY KEY,
                name VARCHAR(150) NOT NULL
            )
        """))
        
        df.to_sql(table_name, conn, if_exists="append", index=False)
    
    print(f"✅ Successfully loaded {len(df)} rows into '{table_name}'")