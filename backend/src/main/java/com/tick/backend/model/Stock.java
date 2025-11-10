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
    private Long id;
    
    @Column(nullable = false)
    private String ticker;
    
    @Column(nullable = false)
    private LocalDate date;
    
    private double open;
    private double high;
    private double low;
    private double close;
    private long volume;
}