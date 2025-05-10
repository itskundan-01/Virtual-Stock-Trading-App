package com.tradingsim.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TradeRequest {
    @NotBlank
    private String symbol;
    
    @NotBlank
    private String type;  // BUY or SELL
    
    @NotNull
    @Min(1)
    private int quantity;
}
