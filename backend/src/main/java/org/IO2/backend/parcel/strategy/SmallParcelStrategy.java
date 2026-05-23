package org.IO2.backend.parcel.strategy;

import java.math.BigDecimal;

public class SmallParcelStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculatePrice(Double weight, Boolean isPriority, Boolean isInsured) {
        BigDecimal price = new BigDecimal("5.00");
        price = price.add(new BigDecimal(weight * 1.5));
        if (isPriority) price = price.add(new BigDecimal("2.00"));
        if (isInsured) price = price.add(new BigDecimal("5.00"));
        return price;
    }
}

