package org.IO2.backend.parcel.strategy;

import java.math.BigDecimal;

public class MediumParcelStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculatePrice(Double weight, Boolean isPriority, Boolean isInsured) {
        BigDecimal price = new BigDecimal("12.00");
        price = price.add(new BigDecimal(weight * 2.0));
        if (isPriority) price = price.add(new BigDecimal("5.00"));
        if (isInsured) price = price.add(new BigDecimal("10.00"));
        return price;
    }
}