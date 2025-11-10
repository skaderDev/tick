package com.tick.backend.controller;

import com.tick.backend.model.Stock;
import com.tick.backend.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockController {
    
    @Autowired
    private StockService stockService;

    @GetMapping("/{ticker}")
    public ResponseEntity<?> getStockData(@PathVariable String ticker) {
        try {
            List<Stock> stockData = stockService.getStockData(ticker);
            if (stockData.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(stockData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching stock data");
        }
    }
}