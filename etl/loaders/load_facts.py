from sqlalchemy import text

def load_fact_student_staff_ratio(df, engine, table_name="fact_student_staff_ratio"):
    """Load student-staff ratio fact table"""
    print(f"\n🚀 Loading {len(df)} rows into '{table_name}'...")
    
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
        
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                ratio_id BIGINT PRIMARY KEY,
                country_id BIGINT NOT NULL,
                year INT,
                students_per_staff DOUBLE PRECISION,
                FOREIGN KEY (country_id) REFERENCES dim_countries(country_id)
            )
        """))
        
        df.to_sql(table_name, conn, if_exists="append", index=False)
    
    print(f"✅ Successfully loaded '{table_name}'")


def load_fact_tertiary_graduates(df, engine, table_name="fact_tertiary_graduates"):
    """Load tertiary graduates fact table"""
    print(f"\n🚀 Loading {len(df)} rows into '{table_name}'...")
    
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
        
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                graduate_id BIGINT PRIMARY KEY,
                country_id BIGINT NOT NULL,
                speciality_id BIGINT NOT NULL,
                graduate_percent DOUBLE PRECISION,
                year INT,
                FOREIGN KEY (country_id) REFERENCES dim_countries(country_id),
                FOREIGN KEY (speciality_id) REFERENCES dim_speciality(speciality_id)
            )
        """))
        
        df.to_sql(table_name, conn, if_exists="append", index=False)
    
    print(f"✅ Successfully loaded '{table_name}'")


def load_fact_university_ranking(df, engine, table_name="fact_university_ranking"):
    """Load university ranking fact table"""
    print(f"\n🚀 Loading {len(df)} rows into '{table_name}'...")
    
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
        
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                university_ranking_id BIGINT PRIMARY KEY,
                university_name TEXT,
                qs_rank INTEGER,
                overall_score NUMERIC,
                country_id BIGINT NOT NULL REFERENCES dim_countries(country_id),
                year INT
            )
        """))
        
        df.to_sql(table_name, conn, if_exists="append", index=False)
    
    print(f"✅ Successfully loaded '{table_name}'")


def load_fact_institution_research(df, engine):
    """Load institution research fact table"""
    print("\n🚀 Loading data into 'fact_institution_research'...")
    
    if df.empty:
        print("⚠️ DataFrame is empty. Aborting load.")
        return
    
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS fact_institution_research CASCADE"))
        
        conn.execute(text("""
            CREATE TABLE fact_institution_research (
                research_id BIGINT PRIMARY KEY,
                institution_id VARCHAR NOT NULL,
                total_citations INT,
                international_collaboration INT,
                top_paper_title TEXT,
                top_paper_doi TEXT,
                FOREIGN KEY (institution_id) REFERENCES dim_institution(institution_id)
            )
        """))
        
        df.to_sql("fact_institution_research", conn, if_exists="append", index=False)
    
    print("✅ Successfully loaded 'fact_institution_research'")


def load_fact_research_investment(mapped_df, engine):
    """Load research investment fact table"""
    print("\n💾 Loading data into FACT_RESEARCH_INVESTMENT...")
    
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS fact_research_investment CASCADE"))
        conn.execute(text("""
            CREATE TABLE fact_research_investment (
                investment_id TEXT PRIMARY KEY,
                country_id BIGINT,
                year INTEGER,
                rd_expenditure_gdp_percent NUMERIC,
                FOREIGN KEY (country_id) REFERENCES dim_countries(country_id)
            )
        """))
        
        mapped_df[['investment_id', 'country_id', 'year', 'rd_expenditure_gdp_percent']].to_sql(
            'fact_research_investment', conn, if_exists='append', index=False
        )
    
    print(f"✅ Loaded {len(mapped_df)} records into FACT_RESEARCH_INVESTMENT")
def load_fact_enrollment(df, engine, table_name="fact_enrollment"):
    """Load enrollment fact table"""
    print(f"\n🚀 Loading {len(df)} rows into '{table_name}'...")
    
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
        
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                enrollment_id VARCHAR(10) PRIMARY KEY,
                field_id VARCHAR(10) NOT NULL REFERENCES dim_field(field_id),
                country_id BIGINT NOT NULL REFERENCES dim_countries(country_id),
                year INT NOT NULL,
                institution_type VARCHAR(100),
                enrollment_percentage NUMERIC(7,4)
            )
        """))
        
        df.to_sql(table_name, conn, if_exists="append", index=False)
    
    print(f"✅ Successfully loaded '{table_name}'")


def load_fact_graduation(df, engine, table_name="fact_graduation"):
    """Load graduation fact table"""
    print(f"\n🚀 Loading {len(df)} rows into '{table_name}'...")
    
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
        
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                graduation_id VARCHAR(10) PRIMARY KEY,
                country_id BIGINT NOT NULL REFERENCES dim_countries(country_id),
                year INT NOT NULL,
                gender VARCHAR(20),
                percentage NUMERIC(7,4)
            )
        """))
        
        df.to_sql(table_name, conn, if_exists="append", index=False)
    
    print(f"✅ Successfully loaded '{table_name}'")


def load_fact_enrollment_abroad(df, engine, table_name="fact_enrollment_abroad"):
    """Load enrollment abroad fact table"""
    print(f"\n🚀 Loading {len(df)} rows into '{table_name}'...")
    
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
        
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                enrollment_abroad_id VARCHAR(10) PRIMARY KEY,
                country_id BIGINT NOT NULL REFERENCES dim_countries(country_id),
                year INT NOT NULL,
                gender VARCHAR(20),
                percentage NUMERIC(7,4)
            )
        """))
        
        df.to_sql(table_name, conn, if_exists="append", index=False)
    
    print(f"✅ Successfully loaded '{table_name}'")


def load_fact_government_expenditure(df, engine, table_name="fact_government_expenditure"):
    """Load government expenditure fact table"""
    print(f"\n🚀 Loading {len(df)} rows into '{table_name}'...")
    
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
        
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                expenditure_id SERIAL PRIMARY KEY,
                country_id BIGINT NOT NULL REFERENCES dim_countries(country_id),
                year INT NOT NULL,
                scholarships NUMERIC(14,2),
                tertiary_expenditure NUMERIC(14,2),
                expenditure_percentage NUMERIC(7,4)
            )
        """))
        
        df.to_sql(table_name, conn, if_exists="append", index=False)
    
    print(f"✅ Successfully loaded '{table_name}'")