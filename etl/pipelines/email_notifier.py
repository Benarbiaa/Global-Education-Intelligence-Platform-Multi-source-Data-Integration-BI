"""
Email Notification System for ETL Pipeline
Sends success/failure notifications with detailed logs
"""
import smtplib
import os
import yaml
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from pathlib import Path


def load_config():
    """Load email configuration from GitHub Secrets or config file"""
    # Try to load from environment variables first (GitHub Secrets)
    if os.getenv('EMAIL_HOST'):
        recipients = os.getenv('EMAIL_RECIPIENTS', os.getenv('EMAIL_RECIPIENT', ''))
        # Handle comma-separated recipients from env var
        recipient_list = [r.strip() for r in recipients.split(',') if r.strip()]
        
        return {
            'email': {
                'smtp_host': os.getenv('EMAIL_HOST'),
                'smtp_port': int(os.getenv('EMAIL_PORT', 587)),
                'sender_email': os.getenv('EMAIL_SENDER'),
                'sender_password': os.getenv('EMAIL_PASSWORD'),
                'recipients': recipient_list  # Changed to list
            }
        }
    
    # Fallback to config file (for local testing)
    config_path = Path(__file__).parent.parent / 'config' / 'config.yaml'
    if config_path.exists():
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    
    raise FileNotFoundError("No email configuration found. Set GitHub Secrets or create config.yaml")


class ETLEmailNotifier:
    """Email notification handler for ETL pipeline"""
    
    def __init__(self):
        config = load_config()
        self.smtp_host = config['email']['smtp_host']
        self.smtp_port = config['email']['smtp_port']
        self.sender_email = config['email']['sender_email']
        self.sender_password = config['email']['sender_password']
        
        # Handle both 'recipients' (list) and 'recipient_email' (single string) for backwards compatibility
        if 'recipients' in config['email']:
            recipients = config['email']['recipients']
            # Ensure it's a list
            self.recipients = recipients if isinstance(recipients, list) else [recipients]
        elif 'recipient_email' in config['email']:
            self.recipients = [config['email']['recipient_email']]
        else:
            raise ValueError("No recipients configured. Use 'recipients' in config.yaml")
        
    def send_email(self, subject, body_html, body_text=None):
        """Send email notification to all recipients"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.sender_email
            msg['To'] = ', '.join(self.recipients)  # Multiple recipients
            
            # Add text and HTML parts
            if body_text:
                part1 = MIMEText(body_text, 'plain')
                msg.attach(part1)
            
            part2 = MIMEText(body_html, 'html')
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, self.recipients, msg.as_string())  # Pass list directly
            
            print(f"✅ Email sent successfully to {', '.join(self.recipients)}")
            return True
            
        except smtplib.SMTPAuthenticationError as e:
            print(f"Email authentication failed: {e}")
            print("Tip: If using Gmail, make sure you're using an App Password, not your regular password")
            print("   Go to: https://myaccount.google.com/apppasswords")
            return False
            
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False
    
    def send_success_notification(self, execution_time, tables_loaded, data_changes=None):
        """Send success notification with execution summary"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        subject = f"ETL Pipeline Success - {timestamp}"
        
        # Build data changes section
        changes_html = ""
        if data_changes:
            changes_html = """
            <h3>Detected Data Changes:</h3>
            <ul>
            """
            for change in data_changes:
                changes_html += f"<li><strong>{change['type']}:</strong> {change['description']}</li>"
            changes_html += "</ul>"
        
        body_html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .success {{ color: #4CAF50; font-weight: bold; }}
                .info-box {{ background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 10px 0; }}
                ul {{ padding-left: 20px; }}
                .footer {{ background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ETL Pipeline Completed Successfully</h1>
            </div>
            
            <div class="content">
                <p class="success">All data warehouse tables have been refreshed successfully!</p>
                
                <div class="info-box">
                    <h3>Execution Summary:</h3>
                    <ul>
                        <li><strong>Timestamp:</strong> {timestamp}</li>
                        <li><strong>Execution Time:</strong> {execution_time}</li>
                        <li><strong>Status:</strong> <span class="success">SUCCESS</span></li>
                    </ul>
                </div>
                
                <div class="info-box">
                    <h3>Tables Loaded:</h3>
                    <ul>
                        <li><strong>Foundation:</strong> {tables_loaded['foundation']} tables</li>
                        <li><strong>Research Mart:</strong> {tables_loaded['research']} tables</li>
                        <li><strong>Education Mart:</strong> {tables_loaded['education']} tables</li>
                        <li><strong>Enrollment Mart:</strong> {tables_loaded['enrollment']} tables</li>
                        <li><strong>Expenditure Mart:</strong> {tables_loaded['expenditure']} tables</li>
                        <li><strong>Total:</strong> {sum(tables_loaded.values())} tables</li>
                    </ul>
                </div>
                
                {changes_html}
                
                <p>All systems are operational. The data warehouse is up to date.</p>
            </div>
            
            <div class="footer">
                <p>Education Data Warehouse ETL Pipeline</p>
                <p>Automated by GitHub Actions</p>
            </div>
        </body>
        </html>
        """
        
        body_text = f"""
        ETL Pipeline Completed Successfully
        
        Timestamp: {timestamp}
        Execution Time: {execution_time}
        Status: SUCCESS
        
        Tables Loaded:
        - Foundation: {tables_loaded['foundation']} tables
        - Research Mart: {tables_loaded['research']} tables
        - Education Mart: {tables_loaded['education']} tables
        - Enrollment Mart: {tables_loaded['enrollment']} tables
        - Expenditure Mart: {tables_loaded['expenditure']} tables
        - Total: {sum(tables_loaded.values())} tables
        
        All systems operational.
        """
        
        return self.send_email(subject, body_html, body_text)
    
    def send_failure_notification(self, error_message, failed_stage, execution_time):
        """Send failure notification with error details"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        subject = f"ETL Pipeline Failed - {timestamp}"
        
        body_html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background-color: #f44336; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .error {{ color: #f44336; font-weight: bold; }}
                .info-box {{ background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 10px 0; }}
                .error-box {{ background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; }}
                .footer {{ background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ETL Pipeline Failed</h1>
            </div>
            
            <div class="content">
                <p class="error">The ETL pipeline encountered an error and did not complete successfully.</p>
                
                <div class="info-box">
                    <h3>Execution Details:</h3>
                    <ul>
                        <li><strong>Timestamp:</strong> {timestamp}</li>
                        <li><strong>Execution Time:</strong> {execution_time}</li>
                        <li><strong>Failed Stage:</strong> {failed_stage}</li>
                        <li><strong>Status:</strong> <span class="error">FAILED</span></li>
                    </ul>
                </div>
                
                <div class="error-box">
                    <h3>Error Details:</h3>
                    <pre>{error_message}</pre>
                </div>
                
                <p><strong>Action Required:</strong> Please check the GitHub Actions logs for detailed error information.</p>
            </div>
            
            <div class="footer">
                <p>Education Data Warehouse ETL Pipeline</p>
                <p>Automated by GitHub Actions</p>
            </div>
        </body>
        </html>
        """
        
        body_text = f"""
        ETL Pipeline Failed
        
        Timestamp: {timestamp}
        Execution Time: {execution_time}
        Failed Stage: {failed_stage}
        Status: FAILED
        
        Error Details:
        {error_message}
        
        Action Required: Check GitHub Actions logs for details.
        """
        
        return self.send_email(subject, body_html, body_text)


def detect_data_changes():
    """
    Detect changes in data files or API endpoints
    Returns list of detected changes
    """
    changes = []
    data_path = Path(__file__).parent.parent.parent / 'data'
    
    try:
        # Check for new CSV files
        if data_path.exists():
            csv_files = list(data_path.glob('*.csv'))
            excel_files = list(data_path.glob('*.xlsx'))
            
            if csv_files:
                changes.append({
                    'type': 'New CSV Files',
                    'description': f"Found {len(csv_files)} CSV files in data directory"
                })
            
            if excel_files:
                changes.append({
                    'type': 'New Excel Files',
                    'description': f"Found {len(excel_files)} Excel files in data directory"
                })
        
      
        
    except Exception as e:
        print(f"Warning: Could not detect data changes: {e}")
    
    return changes