package org.IO2.backend.model;

import org.IO2.backend.parcel.model.ParcelSize;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class PricingTest {

    @Test
    void shouldCreatePricingWithBuilder() {
        BigDecimal basePrice = new BigDecimal("10.00");
        BigDecimal weightMultiplier = new BigDecimal("2.50");
        BigDecimal priorityAddon = new BigDecimal("5.00");
        BigDecimal insuranceAddon = new BigDecimal("3.00");

        Pricing pricing = Pricing.builder()
                .size(ParcelSize.SMALL)
                .basePrice(basePrice)
                .weightMultiplier(weightMultiplier)
                .priorityAddon(priorityAddon)
                .insuranceAddon(insuranceAddon)
                .build();

        assertNotNull(pricing);
        assertEquals(ParcelSize.SMALL, pricing.getSize());
        assertEquals(basePrice, pricing.getBasePrice());
        assertEquals(weightMultiplier, pricing.getWeightMultiplier());
        assertEquals(priorityAddon, pricing.getPriorityAddon());
        assertEquals(insuranceAddon, pricing.getInsuranceAddon());
    }

    @Test
    void shouldCreatePricingForMediumSize() {
        BigDecimal basePrice = new BigDecimal("15.00");
        BigDecimal weightMultiplier = new BigDecimal("3.00");
        BigDecimal priorityAddon = new BigDecimal("7.50");
        BigDecimal insuranceAddon = new BigDecimal("4.50");

        Pricing pricing = Pricing.builder()
                .size(ParcelSize.MEDIUM)
                .basePrice(basePrice)
                .weightMultiplier(weightMultiplier)
                .priorityAddon(priorityAddon)
                .insuranceAddon(insuranceAddon)
                .build();

        assertEquals(ParcelSize.MEDIUM, pricing.getSize());
        assertEquals(basePrice, pricing.getBasePrice());
    }

    @Test
    void shouldCreatePricingForLargeSize() {
        BigDecimal basePrice = new BigDecimal("25.00");
        BigDecimal weightMultiplier = new BigDecimal("4.00");
        BigDecimal priorityAddon = new BigDecimal("10.00");
        BigDecimal insuranceAddon = new BigDecimal("6.00");

        // Act
        Pricing pricing = Pricing.builder()
                .size(ParcelSize.LARGE)
                .basePrice(basePrice)
                .weightMultiplier(weightMultiplier)
                .priorityAddon(priorityAddon)
                .insuranceAddon(insuranceAddon)
                .build();

        assertEquals(ParcelSize.LARGE, pricing.getSize());
    }

    @Test
    void shouldSetAndGetPricingId() {
        Long id = 1L;
        Pricing pricing = Pricing.builder()
                .id(id)
                .size(ParcelSize.SMALL)
                .basePrice(new BigDecimal("10.00"))
                .weightMultiplier(new BigDecimal("2.50"))
                .priorityAddon(new BigDecimal("5.00"))
                .insuranceAddon(new BigDecimal("3.00"))
                .build();

        assertEquals(id, pricing.getId());
    }

    @Test
    void shouldAllowModifyingPricingFields() {
        Pricing pricing = Pricing.builder()
                .size(ParcelSize.SMALL)
                .basePrice(new BigDecimal("10.00"))
                .weightMultiplier(new BigDecimal("2.50"))
                .priorityAddon(new BigDecimal("5.00"))
                .insuranceAddon(new BigDecimal("3.00"))
                .build();

        pricing.setBasePrice(new BigDecimal("12.00"));
        pricing.setWeightMultiplier(new BigDecimal("3.00"));
        pricing.setPriorityAddon(new BigDecimal("6.00"));
        pricing.setInsuranceAddon(new BigDecimal("4.00"));

        assertEquals(new BigDecimal("12.00"), pricing.getBasePrice());
        assertEquals(new BigDecimal("3.00"), pricing.getWeightMultiplier());
        assertEquals(new BigDecimal("6.00"), pricing.getPriorityAddon());
        assertEquals(new BigDecimal("4.00"), pricing.getInsuranceAddon());
    }

    @Test
    void shouldCreatePricingWithNoArgsConstructor() {
        Pricing pricing = new Pricing();

        assertNotNull(pricing);
    }

    @Test
    void shouldCreatePricingWithAllArgsConstructor() {
        Long id = 2L;
        BigDecimal basePrice = new BigDecimal("20.00");
        BigDecimal weightMultiplier = new BigDecimal("3.50");
        BigDecimal priorityAddon = new BigDecimal("8.00");
        BigDecimal insuranceAddon = new BigDecimal("5.00");

        Pricing pricing = new Pricing(
                id,
                ParcelSize.MEDIUM,
                basePrice,
                weightMultiplier,
                priorityAddon,
                insuranceAddon
        );

        assertEquals(id, pricing.getId());
        assertEquals(ParcelSize.MEDIUM, pricing.getSize());
        assertEquals(basePrice, pricing.getBasePrice());
        assertEquals(weightMultiplier, pricing.getWeightMultiplier());
        assertEquals(priorityAddon, pricing.getPriorityAddon());
        assertEquals(insuranceAddon, pricing.getInsuranceAddon());
    }

}

