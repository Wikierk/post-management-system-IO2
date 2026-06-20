package org.IO2.backend.parcel.strategy;

import org.IO2.backend.parcel.model.ParcelSize;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class PricingStrategyFactoryTest {

    @Test
    void shouldReturnDynamicPricingStrategyForSmallParcel() {
        assertInstanceOf(DynamicPricingStrategy.class, PricingStrategyFactory.getStrategy(ParcelSize.SMALL));
    }

    @Test
    void shouldReturnDynamicPricingStrategyForMediumParcel() {
        assertInstanceOf(DynamicPricingStrategy.class, PricingStrategyFactory.getStrategy(ParcelSize.MEDIUM));
    }

    @Test
    void shouldReturnDynamicPricingStrategyForLargeParcel() {
        assertInstanceOf(DynamicPricingStrategy.class, PricingStrategyFactory.getStrategy(ParcelSize.LARGE));
    }
}

