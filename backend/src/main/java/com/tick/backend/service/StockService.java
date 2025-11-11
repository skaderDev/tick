package com.tick.backend.service;

// In StockService.java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.tick.backend.model.Stock;
import com.tick.backend.repository.StockRepository;
import java.util.List;

@Service
public class StockService {
    
    @Autowired
    private StockRepository stockRepository;
    
    public List<Stock> getStockData(String ticker) {
        return stockRepository.findByTickerOrderByDateAsc(ticker);
    }
    
    public List<String> getAvailableTickers() {
        // This is a simple implementation - you might need to adjust based on your needs
        return List.of("AAPL", "MSFT", "GOOGL");
    }
}