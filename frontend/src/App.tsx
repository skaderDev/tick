import React from 'react';
import { CssBaseline, Container, Typography } from '@mui/material';
import StockChart from './components/StockChart';

const App: React.FC = () => {
  return (
    <CssBaseline>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Stock Market Dashboard
        </Typography>
        <StockChart />
      </Container>
    </CssBaseline>
  );
};

export default App;