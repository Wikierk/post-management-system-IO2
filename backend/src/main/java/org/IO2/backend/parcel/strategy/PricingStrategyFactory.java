package org.IO2.backend.parcel.strategy;


import org.IO2.backend.parcel.model.ParcelSize;

public class PricingStrategyFactory {
    public static PricingStrategy getStrategy(ParcelSize size) {
        return new DynamicPricingStrategy();
    }
}