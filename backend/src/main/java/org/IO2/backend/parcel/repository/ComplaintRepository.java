package org.IO2.backend.parcel.repository;

import org.IO2.backend.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findBySubmittedByEmail(String email);
}
