import yfinance as yf

# Create a Ticker object
aapl = yf.Ticker("AAPL")

# Get historical market data
hist = aapl.history(period="1mo")  # 1 month of data
print(hist.head())  # Show first few rows