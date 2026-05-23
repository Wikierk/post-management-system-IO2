package org.IO2.backend.parcel.repository;

import org.IO2.backend.parcel.model.Parcel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ParcelRepository extends JpaRepository<Parcel, Long> {
    Optional<Parcel> findByTrackingNumber(String trackingNumber);
    List<Parcel> findBySenderEmail(String email);
}
