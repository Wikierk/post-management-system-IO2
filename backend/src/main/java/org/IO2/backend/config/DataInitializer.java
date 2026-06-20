package org.IO2.backend.config;

import org.IO2.backend.model.Pricing;
import org.IO2.backend.parcel.model.ParcelSize;
import org.IO2.backend.parcel.repository.PricingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initPricing(PricingRepository pricingRepository) {
        return args -> {
            if (pricingRepository.count() == 0) {
                pricingRepository.save(new Pricing(null, ParcelSize.SMALL, new BigDecimal("5.00"), new BigDecimal("1.50"), new BigDecimal("2.00"), new BigDecimal("5.00")));
                pricingRepository.save(new Pricing(null, ParcelSize.MEDIUM, new BigDecimal("12.00"), new BigDecimal("2.00"), new BigDecimal("5.00"), new BigDecimal("10.00")));
                pricingRepository.save(new Pricing(null, ParcelSize.LARGE, new BigDecimal("25.00"), new BigDecimal("3.00"), new BigDecimal("10.00"), new BigDecimal("20.00")));
                System.out.println("Utworzono domyślne cenniki w bazie danych!");
            }
        };
    }
}
