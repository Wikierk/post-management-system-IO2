package org.IO2.backend.parcel.strategy;

import java.math.BigDecimal;

public interface PricingStrategy {
    BigDecimal calculatePrice(Double weight, Boolean isPriority, Boolean isInsured);
}
