package com.tradingsim.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequest {
    @NotBlank
    @Size(min = 3, max = 100)
    private String title;
    
    @NotBlank
    private String content;
    
    private String category;
}
