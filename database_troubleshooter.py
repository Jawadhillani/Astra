# database_troubleshooter.py
# Add this file to your project and run it separately to test your database connection

import os
import sys
import socket
import time
import logging
from dotenv import load_dotenv
import psycopg2

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("DB-Troubleshooter")

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres.srzcxykhrysxwpyxmlzy:8M1X4lkh41GTR!@aws-0-us-west-1.pooler.supabase.com:6543/postgres")

def parse_db_url(url):
    """Parse database URL into components"""
    if url.startswith('postgresql://'):
        # Format: postgresql://username:password@hostname:port/database
        auth_url = url.replace('postgresql://', '')
        
        # Split at @ to separate credentials from host info
        if '@' in auth_url:
            credentials, host_info = auth_url.split('@', 1)
        else:
            credentials, host_info = "", auth_url
        
        # Get username and password
        if ':' in credentials:
            username, password = credentials.split(':', 1)
        else:
            username, password = credentials, ""
        
        # Get hostname, port, and database
        if '/' in host_info:
            host_port, database = host_info.split('/', 1)
        else:
            host_port, database = host_info, ""
        
        # Split hostname and port
        if ':' in host_port:
            hostname, port = host_port.split(':', 1)
            try:
                port = int(port)
            except ValueError:
                port = 5432
        else:
            hostname, port = host_port, 5432
        
        return {
            'username': username,
            'password': '***' if password else '',  # Hide password in logs
            'hostname': hostname,
            'port': port,
            'database': database
        }
    else:
        return {'url': url}

def test_socket_connection(hostname, port, timeout=5):
    """Test raw socket connection to the database server"""
    logger.info(f"Testing TCP socket connection to {hostname}:{port}...")
    
    try:
        # Create socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        
        # Start time
        start_time = time.time()
        
        # Try to connect
        result = sock.connect_ex((hostname, port))
        
        # End time
        end_time = time.time()
        duration = end_time - start_time
        
        # Close socket
        sock.close()
        
        if result == 0:
            logger.info(f"Socket connection successful in {duration:.2f} seconds")
            return True
        else:
            logger.error(f"Socket connection failed with error code {result} after {duration:.2f} seconds")
            if result == 111:
                logger.error("Error 111: Connection refused - server is not accepting connections")
            elif result == 110:
                logger.error("Error 110: Connection timed out - server unreachable or blocked by firewall")
            elif result == 113:
                logger.error("Error 113: No route to host - network routing issue")
            return False
    
    except socket.gaierror:
        logger.error(f"Hostname resolution failed for {hostname}")
        return False
    except Exception as e:
        logger.error(f"Socket test error: {str(e)}")
        return False

def test_psycopg2_connection(db_url):
    """Test PostgreSQL connection using psycopg2"""
    logger.info("Testing PostgreSQL connection using psycopg2...")
    
    try:
        start_time = time.time()
        conn = psycopg2.connect(db_url, connect_timeout=10)
        duration = time.time() - start_time
        
        logger.info(f"Database connection successful in {duration:.2f} seconds")
        
        # Test a simple query
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        logger.info(f"Query result: {result}")
        
        cursor.close()
        conn.close()
        return True
    
    except psycopg2.OperationalError as e:
        duration = time.time() - start_time
        logger.error(f"Database connection failed after {duration:.2f} seconds: {str(e)}")
        
        if "timeout" in str(e).lower():
            logger.error("Connection timed out - server unreachable, blocked by firewall, or incorrect port")
        elif "authentication" in str(e).lower():
            logger.error("Authentication failed - check username and password")
        elif "does not exist" in str(e).lower():
            logger.error("Database does not exist - check database name")
        
        return False
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False

def run_diagnostics():
    """Run a series of diagnostic tests for database connection"""
    logger.info("==== Supabase Database Connection Troubleshooter ====")
    
    # Check if DATABASE_URL is defined
    if not DATABASE_URL:
        logger.error("DATABASE_URL environment variable is not set")
        return
    
    # Parse and log database URL (without password)
    db_components = parse_db_url(DATABASE_URL)
    logger.info(f"Database components: {db_components}")
    
    # Test hostname resolution
    hostname = db_components.get('hostname')
    port = db_components.get('port', 5432)
    
    if not hostname:
        logger.error("Could not extract hostname from DATABASE_URL")
        return
    
    try:
        logger.info(f"Resolving hostname: {hostname}")
        ip_addresses = socket.gethostbyname_ex(hostname)[2]
        logger.info(f"Hostname resolves to: {', '.join(ip_addresses)}")
    except socket.gaierror:
        logger.error(f"Could not resolve hostname: {hostname}")
        logger.info("This indicates a DNS resolution problem")
        return
    
    # Test socket connection
    socket_ok = test_socket_connection(hostname, port)
    
    if not socket_ok:
        logger.error("Socket connection failed. Possible causes:")
        logger.error("1. Server is down or unreachable")
        logger.error("2. Firewall is blocking the connection")
        logger.error("3. Incorrect hostname or port")
        logger.error("4. Network connectivity issues")
        return
    
    # Test actual database connection
    test_psycopg2_connection(DATABASE_URL)

if __name__ == "__main__":
    run_diagnostics()