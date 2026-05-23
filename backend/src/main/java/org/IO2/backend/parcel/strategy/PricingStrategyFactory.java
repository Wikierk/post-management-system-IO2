package org.IO2.backend.parcel.strategy;


import org.IO2.backend.parcel.model.ParcelSize;

public class PricingStrategyFactory {
    public static PricingStrategy getStrategy(ParcelSize size) {
        return switch (size) {
            case SMALL -> new SmallParcelStrategy();
            case MEDIUM -> new MediumParcelStrategy();
            case LARGE -> new LargeParcelStrategy();
        };
    }
}