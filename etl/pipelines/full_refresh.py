"""
MASTER ETL ORCHESTRATOR
Runs ALL pipelines in correct dependency order
Use this in GitHub Actions for full refresh
"""
import time
import traceback
from datetime import datetime
from .run_foundation import run_foundation
from .run_research_mart import run_research_mart
from .run_education_mart import run_education_mart
from .run_enrollment_mart import run_enrollment_mart
from .run_expenditure_mart import run_expenditure_mart
from .email_notifier import ETLEmailNotifier, detect_data_changes


def full_refresh(send_email=True):
    """
    Execute complete data warehouse refresh
    
    Args:
        send_email (bool): Whether to send email notifications (default: True)
    """
    start_time = time.time()
    start_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    print("\n" + "=" * 80)
    print(f"🚀 STARTING FULL DATA WAREHOUSE REFRESH - {start_timestamp}")
    print("=" * 80)
    
    failed_stage = None
    error_message = None
    
    try:
        # STEP 1: Foundation (shared dimensions)
        print("\n📦 PHASE 1: Loading Foundation Dimensions...")
        run_foundation()
        
        # STEP 2: Research Mart
        print("\n📦 PHASE 2: Loading Research & Innovation Mart...")
        failed_stage = "Research Mart"
        run_research_mart()
        
        # STEP 3: Education Mart
        print("\n📦 PHASE 3: Loading Education Performance Mart...")
        failed_stage = "Education Mart"
        run_education_mart()
        
        # STEP 4: Enrollment Mart
        print("\n📦 PHASE 4: Loading Enrollment & Graduation Mart...")
        failed_stage = "Enrollment Mart"
        run_enrollment_mart()
        
        # STEP 5: Expenditure Mart
        print("\n📦 PHASE 5: Loading Government Expenditure Mart...")
        failed_stage = "Expenditure Mart"
        run_expenditure_mart()
        
        # Calculate execution time
        end_time = time.time()
        execution_time = format_duration(end_time - start_time)
        
        print("\n" + "=" * 80)
        print("✅ FULL DATA WAREHOUSE REFRESH COMPLETED SUCCESSFULLY!")
        print("=" * 80)
        print(f"\n⏱️  Total Execution Time: {execution_time}")
        print("\n📊 Summary:")
        print("   - Foundation: 2 dimension tables (dim_countries, dim_speciality)")
        print("   - Research Mart: 1 dimension + 2 fact tables")
        print("   - Education Mart: 3 fact tables")
        print("   - Enrollment Mart: 1 dimension (dim_field) + 3 fact tables")
        print("   - Expenditure Mart: 1 fact table")
        print("   - Total: 4 dimensions + 9 facts = 13 tables\n")
        
        # Send success email
        if send_email:
            try:
                notifier = ETLEmailNotifier()
                tables_loaded = {
                    'foundation': 2,
                    'research': 3,
                    'education': 3,
                    'enrollment': 4,
                    'expenditure': 1
                }
                
                # Detect data changes
                data_changes = detect_data_changes()
                
                notifier.send_success_notification(
                    execution_time=execution_time,
                    tables_loaded=tables_loaded,
                    data_changes=data_changes
                )
            except Exception as email_error:
                print(f"⚠️  Warning: Could not send email notification: {email_error}")
        
        return True
        
    except Exception as e:
        # Calculate execution time
        end_time = time.time()
        execution_time = format_duration(end_time - start_time)
        
        error_message = f"{str(e)}\n\n{traceback.format_exc()}"
        
        print("\n" + "=" * 80)
        print("❌ ETL PIPELINE FAILED!")
        print("=" * 80)
        print(f"\n⏱️  Execution Time: {execution_time}")
        print(f"❌ Failed Stage: {failed_stage}")
        print(f"❌ Error: {str(e)}")
        print("\n" + "=" * 80)
        
        # Send failure email
        if send_email:
            try:
                notifier = ETLEmailNotifier()
                notifier.send_failure_notification(
                    error_message=error_message,
                    failed_stage=failed_stage,
                    execution_time=execution_time
                )
            except Exception as email_error:
                print(f"⚠️  Warning: Could not send email notification: {email_error}")
        
        raise


def format_duration(seconds):
    """Format duration in seconds to human-readable string"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    
    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    parts.append(f"{secs}s")
    
    return " ".join(parts)


if __name__ == "__main__":
    full_refresh()