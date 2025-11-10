import yfinance as yf
from datetime import datetime, timedelta
import logging
import pandas as pd
from typing import Optional, Dict, Any

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StockFetcher:
    """Fetches and manages stock market data using yfinance."""
    
    def __init__(self, ticker: str):
        """
        Initialize with a stock ticker symbol.
        
        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL' for Apple)
        """
        self.ticker = ticker.upper()
        self.data: Optional[pd.DataFrame] = None

    def fetch(self, period: str = "1mo") -> bool:
        """
        Fetch stock data for the given period.
        
        Args:
            period: Time period (e.g., '1mo', '3mo', '1y')
            
        Returns:
            bool: True if fetch was successful, False otherwise
        """
        try:
            logger.info(f"Fetching {period} of data for {self.ticker}")
            stock = yf.Ticker(self.ticker)
            self.data = stock.history(period=period)
            
            if self.data.empty:
                logger.warning(f"No data found for {self.ticker}")
                return False
                
            logger.info(f"Successfully fetched {len(self.data)} data points")
            return True
            
        except Exception as e:
            logger.error(f"Error fetching data: {e}")
            return False

    def get_metadata(self) -> Dict[str, Any]:
        """Get metadata about the fetched data."""
        if self.data is None:
            return {"error": "No data available. Fetch data first."}
            
        return {
            "ticker": self.ticker,
            "start_date": self.data.index.min().strftime("%Y-%m-%d"),
            "end_date": self.data.index.max().strftime("%Y-%m-%d"),
            "data_points": len(self.data),
            "columns": list(self.data.columns)
        }

    def save_to_csv(self, filename: str = None) -> bool:
        """
        Save the fetched data to a CSV file.
        
        Args:
            filename: Optional custom filename. If None, uses f"{ticker}_stock_data.csv"
            
        Returns:
            bool: True if save was successful, False otherwise
        """
        if self.data is None:
            logger.warning("No data to save. Fetch data first.")
            return False
            
        try:
            if filename is None:
                filename = f"data/raw/{self.ticker}_stock_data.csv"
            
            self.data.to_csv(filename)
            logger.info(f"Data saved to {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving data: {e}")
            return False

def main():
    """Example usage of the StockFetcher class."""
    # Get user input
    ticker = input("Enter stock ticker (e.g., AAPL, MSFT, GOOGL): ").strip().upper()
    period = input("Enter time period (e.g., 1mo, 3mo, 1y): ").strip().lower()
    
    # Create and use the fetcher
    fetcher = StockFetcher(ticker)
    
    if fetcher.fetch(period=period):
        # Show metadata
        print("\n=== Data Summary ===")
        for key, value in fetcher.get_metadata().items():
            print(f"{key.replace('_', ' ').title()}: {value}")
        
        # Save to CSV
        if input("\nSave to CSV? (y/n): ").lower() == 'y':
            fetcher.save_to_csv()
            print("Data saved successfully!")
    else:
        print("Failed to fetch data. Please check the ticker symbol and try again.")

if __name__ == "__main__":
    main()