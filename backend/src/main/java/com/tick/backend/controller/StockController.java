package com.tick.backend.controller;

// In StockController.java
import org.springframework.web.bind.annotation.*;
import com.tick.backend.model.Stock;
import com.tick.backend.service.StockService;
import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:3000")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/{ticker}")
    public List<Stock> getStockData(@PathVariable String ticker) {
        return stockService.getStockData(ticker.toUpperCase());
    }

    @GetMapping("/tickers")
    public List<String> getAvailableTickers() {
        return stockService.getAvailableTickers();
    }
}