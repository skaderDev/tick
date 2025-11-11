import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
  Brush,
  Area,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';

interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20: number | null;
  rsi: number | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ p: 2, minWidth: 180, backgroundColor: 'background.paper' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {new Date(label).toLocaleDateString()}
        </Typography>
        <Typography>Open: ${data.open?.toFixed(2) || 'N/A'}</Typography>
        <Typography>High: ${data.high?.toFixed(2) || 'N/A'}</Typography>
        <Typography>Low: ${data.low?.toFixed(2) || 'N/A'}</Typography>
        <Typography>Close: ${data.close?.toFixed(2) || 'N/A'}</Typography>
        <Typography>Volume: {data.volume?.toLocaleString() || 'N/A'}</Typography>
        <Typography color="#ff7300">SMA 20: {data.sma20?.toFixed(2) || 'N/A'}</Typography>
        <Typography color="#82ca9d">RSI: {data.rsi?.toFixed(2) || 'N/A'}</Typography>
      </Paper>
    );
  }
  return null;
};

const StockChart: React.FC = () => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ticker, setTicker] = useState<string>('AAPL');
  const [availableTickers, setAvailableTickers] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<string>('1y');
  const [showIndicators, setShowIndicators] = useState({
    sma: true,
    rsi: true
  });

  const fetchData = async (selectedTicker: string, range: string = '1y') => {
    try {
      setLoading(true);
      const response = await axios.get<StockData[]>(
        `http://localhost:8080/api/stocks/${selectedTicker}`
      );
      
      let data = [...response.data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Filter data based on time range
      const now = new Date();
      let cutoffDate = new Date();
      
      switch(range) {
        case '1m': cutoffDate.setMonth(now.getMonth() - 1); break;
        case '3m': cutoffDate.setMonth(now.getMonth() - 3); break;
        case '6m': cutoffDate.setMonth(now.getMonth() - 6); break;
        case '1y': cutoffDate.setFullYear(now.getFullYear() - 1); break;
        case '5y': cutoffDate.setFullYear(now.getFullYear() - 5); break;
        default: cutoffDate.setFullYear(now.getFullYear() - 1);
      }
      
      data = data.filter(item => new Date(item.date) >= cutoffDate);
      setStockData(data);
    } catch (err) {
      setError('Failed to fetch stock data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await axios.get<string[]>('http://localhost:8080/api/stocks/tickers');
        setAvailableTickers(response.data);
      } catch (err) {
        console.error('Error fetching tickers:', err);
      }
    };
    fetchTickers();
  }, []);

  useEffect(() => {
    fetchData(ticker, timeRange);
  }, [ticker, timeRange]);

  const handleTickerChange = (event: SelectChangeEvent) => {
    const newTicker = event.target.value;
    setTicker(newTicker);
  };

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newRange: string | null,
  ) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  const handleIndicatorToggle = (indicator: 'sma' | 'rsi') => {
    setShowIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  if (loading && stockData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const closePrices = stockData.map(item => item.close).filter(Boolean) as number[];
  const minClose = closePrices.length > 0 ? Math.min(...closePrices) * 0.98 : 0;
  const maxClose = closePrices.length > 0 ? Math.max(...closePrices) * 1.02 : 100;

  return (
    <Paper sx={{ p: 3, width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h2">
          {ticker} Stock Analysis
        </Typography>
        
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="ticker-select-label">Ticker</InputLabel>
            <Select
              labelId="ticker-select-label"
              value={ticker}
              label="Ticker"
              onChange={handleTickerChange}
            >
              {availableTickers.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
            color="primary"
          >
            <ToggleButton value="1m">1M</ToggleButton>
            <ToggleButton value="3m">3M</ToggleButton>
            <ToggleButton value="6m">6M</ToggleButton>
            <ToggleButton value="1y">1Y</ToggleButton>
            <ToggleButton value="5y">5Y</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup size="small" color="primary">
            <ToggleButton
              value="sma"
              selected={showIndicators.sma}
              onChange={() => handleIndicatorToggle('sma')}
            >
              SMA 20
            </ToggleButton>
            <ToggleButton
              value="rsi"
              selected={showIndicators.rsi}
              onChange={() => handleIndicatorToggle('rsi')}
            >
              RSI
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      
      <Box sx={{ height: 400, mb: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={stockData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
              tick={{ fill: '#666' }}
            />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              domain={[minClose, maxClose]}
              tick={{ fill: '#666' }}
              label={{ 
                value: 'Price ($)', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#666'
              }}
            />
            {showIndicators.rsi && (
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 100]}
                tick={{ fill: '#666' }}
                label={{ 
                  value: 'RSI', 
                  angle: 90, 
                  position: 'insideRight',
                  fill: '#666'
                }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="close"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorClose)"
              name="Closing Price"
            />
            
            {showIndicators.sma && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sma20"
                stroke="#ff7300"
                dot={false}
                name="20-Day SMA"
              />
            )}
            
            {showIndicators.rsi && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rsi"
                stroke="#82ca9d"
                dot={false}
                name="RSI (14)"
              />
            )}
            
            {showIndicators.rsi && (
              <>
                <ReferenceLine yAxisId="right" y={70} stroke="#ff4d4f" strokeDasharray="3 3" />
                <ReferenceLine yAxisId="right" y={30} stroke="#52c41a" strokeDasharray="3 3" />
              </>
            )}
            
            <Brush 
              dataKey="date" 
              height={30} 
              stroke="#8884d8"
              tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
      
      <Box sx={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={stockData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
              tick={{ fill: '#666' }}
            />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              tick={{ fill: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              yAxisId="left"
              dataKey="volume" 
              fill="#8884d8" 
              name="Volume" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default StockChart;