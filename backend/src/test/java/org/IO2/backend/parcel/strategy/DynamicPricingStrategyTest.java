package org.IO2.backend.parcel.strategy;

import org.IO2.backend.model.Pricing;
import org.IO2.backend.parcel.model.ParcelSize;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DynamicPricingStrategyTest {

    private DynamicPricingStrategy strategy;
    private Pricing mockPricing;

    @BeforeEach
    void setUp() {
        strategy = new DynamicPricingStrategy();
        mockPricing = Pricing.builder()
                .size(ParcelSize.MEDIUM)
                .basePrice(new BigDecimal("12.00"))
                .weightMultiplier(new BigDecimal("2.00"))
                .priorityAddon(new BigDecimal("5.00"))
                .insuranceAddon(new BigDecimal("10.00"))
                .build();
    }

    @Test
    void shouldCalculatePriceWithoutAddons() {

        BigDecimal result = strategy.calculatePrice(3.0, false, false, mockPricing);

        assertEquals(0, new BigDecimal("18.00").compareTo(result), "Cena bazowa z wagą wyliczona niepoprawnie");
    }

    @Test
    void shouldCalculatePriceWithAllAddons() {

        BigDecimal result = strategy.calculatePrice(3.0, true, true, mockPricing);

        assertEquals(0, new BigDecimal("33.00").compareTo(result), "Cena z dodatkami wyliczona niepoprawnie");
    }
}
