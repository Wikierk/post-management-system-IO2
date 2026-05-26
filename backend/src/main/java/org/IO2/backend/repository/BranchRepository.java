package org.IO2.backend.repository;

import org.IO2.backend.model.Branch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    @Query("SELECT b FROM Branch b WHERE " +
            "LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(b.address) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Branch> findBySearchTerm(@Param("search") String search, Pageable pageable);

    Page<Branch> findAll(Pageable pageable);
}
