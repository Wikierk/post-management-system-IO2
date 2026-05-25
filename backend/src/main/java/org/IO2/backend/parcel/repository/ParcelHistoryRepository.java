package org.IO2.backend.parcel.repository;

import org.IO2.backend.parcel.model.ParcelHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParcelHistoryRepository extends JpaRepository<ParcelHistory, Long> {
    List<ParcelHistory> findByParcelTrackingNumberOrderByChangedAtDesc(String trackingNumber);
}

