package org.IO2.backend.dto;

import lombok.Data;

@Data
public class ComplaintRequest {
    private String trackingNumber;
    private String reason;
}