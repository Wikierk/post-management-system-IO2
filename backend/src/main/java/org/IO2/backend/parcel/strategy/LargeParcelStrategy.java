package org.IO2.backend.parcel.strategy;

import java.math.BigDecimal;

public class LargeParcelStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculatePrice(Double weight, Boolean isPriority, Boolean isInsured) {
        BigDecimal price = new BigDecimal("25.00");
        price = price.add(new BigDecimal(weight * 3.0));
        if (isPriority) price = price.add(new BigDecimal("10.00"));
        if (isInsured) price = price.add(new BigDecimal("20.00"));
        return price;
    }
}

