package org.IO2.backend.parcel.strategy;

import org.IO2.backend.model.Pricing;

import java.math.BigDecimal;

public interface PricingStrategy {
    BigDecimal calculatePrice(Double weight, Boolean isPriority, Boolean isInsured, Pricing pricing);
}

