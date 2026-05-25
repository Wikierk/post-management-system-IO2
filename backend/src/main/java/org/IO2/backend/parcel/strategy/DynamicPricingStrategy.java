package org.IO2.backend.parcel.strategy;

import org.IO2.backend.model.Pricing;

import java.math.BigDecimal;

public class DynamicPricingStrategy implements PricingStrategy {
    @Override
    public BigDecimal calculatePrice(Double weight, Boolean isPriority, Boolean isInsured, Pricing pricing) {
        BigDecimal price = pricing.getBasePrice();
        price = price.add(pricing.getWeightMultiplier().multiply(new BigDecimal(weight)));

        if (isPriority) price = price.add(pricing.getPriorityAddon());
        if (isInsured) price = price.add(pricing.getInsuranceAddon());

        return price;
    }
}
