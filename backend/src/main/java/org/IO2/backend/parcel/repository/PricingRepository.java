package org.IO2.backend.parcel.repository;

import org.IO2.backend.model.Pricing;
import org.IO2.backend.parcel.model.ParcelSize;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PricingRepository extends JpaRepository<Pricing, Long> {
    Optional<Pricing> findBySize(ParcelSize size);
}
