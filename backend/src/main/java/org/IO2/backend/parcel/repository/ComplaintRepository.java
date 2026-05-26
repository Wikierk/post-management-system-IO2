package org.IO2.backend.parcel.repository;

import java.util.List;

import org.IO2.backend.model.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findBySubmittedByEmail(String email);

    @Query("SELECT c FROM Complaint c WHERE c.status = :status AND " +
            "(LOWER(c.parcel.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.reason) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Complaint> findByStatusAndSearchTerm(@Param("status") String status, @Param("search") String search, Pageable pageable);

    Page<Complaint> findAll(Pageable pageable);

    Page<Complaint> findByStatus(@Param("status") String status, Pageable pageable);
}
