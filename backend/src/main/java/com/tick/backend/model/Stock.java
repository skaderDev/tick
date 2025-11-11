package com.tick.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "stocks")
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;  // Changed from Long to Integer
    
    @Column(nullable = false)
    private String ticker;
    
    @Column(nullable = false)
    private LocalDate date;
    
    private Double open;
    private Double high;
    private Double low;
    private Double close;
    private Long volume;
    private Double sma20;
    private Double rsi;
}