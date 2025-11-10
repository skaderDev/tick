package com.tick.backend.service;

import com.tick.backend.model.Stock;
import com.tick.backend.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StockService {
    @Autowired
    private StockRepository stockRepository;

    public List<Stock> getStockData(String ticker) {
        return stockRepository.findByTickerOrderByDateAsc(ticker);
    }

    // Add more methods as needed
}