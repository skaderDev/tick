import yfinance as yf
import pandas as pd
from ta.trend import SMAIndicator
from ta.momentum import RSIIndicator
import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection parameters
db_params = {
    'dbname': 'postgres',
    'user': 'postgres',
    'password': os.getenv('SUPABASE_PASSWORD'),
    'host': 'db.aqnixljunlwjvnxtwhhq.supabase.co',
    'port': '5432',
    'sslmode': 'require'
}

def create_table(conn):
    """Create the stocks table if it doesn't exist."""
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS stocks (
        id SERIAL PRIMARY KEY,
        ticker VARCHAR(10) NOT NULL,
        date DATE NOT NULL,
        open FLOAT,
        high FLOAT,
        low FLOAT,
        close FLOAT,
        volume BIGINT,
        sma_20 FLOAT,
        rsi FLOAT,
        UNIQUE(ticker, date)
    );
    """
    with conn.cursor() as cur:
        cur.execute(create_table_sql)
    conn.commit()

def fetch_stock_data(ticker: str, period: str = "1y") -> pd.DataFrame:
    """Fetch stock data and calculate indicators."""
    try:
        # Download stock data
        stock = yf.Ticker(ticker)
        df = stock.history(period=period)
        
        # Reset index to make Date a column
        df = df.reset_index()
        df['date'] = df['Date'].dt.date
        
        # Calculate technical indicators
        df['sma_20'] = SMAIndicator(close=df['Close'], window=20).sma_indicator()
        df['rsi'] = RSIIndicator(close=df['Close'], window=14).rsi()
        
        return df[['date', 'Open', 'High', 'Low', 'Close', 'Volume', 'sma_20', 'rsi']]
    
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return pd.DataFrame()

def save_to_postgres(conn, df: pd.DataFrame, ticker: str) -> None:
    """Save stock data to PostgreSQL."""
    if df.empty:
        return
        
    # Prepare data for insertion
    records = []
    for _, row in df.iterrows():
        records.append((
            ticker,
            row['date'],
            float(row['Open']),
            float(row['High']),
            float(row['Low']),
            float(row['Close']),
            int(row['Volume']),
            float(row['sma_20']) if not pd.isna(row['sma_20']) else None,
            float(row['rsi']) if not pd.isna(row['rsi']) else None
        ))
    
    # Insert data
    with conn.cursor() as cur:
        insert_sql = """
        INSERT INTO stocks (ticker, date, open, high, low, close, volume, sma_20, rsi)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (ticker, date) DO UPDATE SET
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close,
            volume = EXCLUDED.volume,
            sma_20 = EXCLUDED.sma_20,
            rsi = EXCLUDED.rsi;
        """
        cur.executemany(insert_sql, records)
        conn.commit()
        print(f"Successfully saved {len(records)} records for {ticker}")

if __name__ == "__main__":
    # Connect to the database
    conn = psycopg2.connect(**db_params)
    
    try:
        # Create table if it doesn't exist
        create_table(conn)
        
        # Example usage
        tickers = ["AAPL", "MSFT", "GOOGL"]
        for ticker in tickers:
            print(f"Fetching data for {ticker}...")
            df = fetch_stock_data(ticker)
            if not df.empty:
                save_to_postgres(conn, df, ticker)
            else:
                print(f"No data found for {ticker}")
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Close the database connection
        if conn is not None:
            conn.close()