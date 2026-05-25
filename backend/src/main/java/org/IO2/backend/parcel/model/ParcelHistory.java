package org.IO2.backend.parcel.model;

import jakarta.persistence.*;
import lombok.*;
import org.IO2.backend.model.Branch;
import org.IO2.backend.model.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "parcel_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParcelHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parcel_id", nullable = false)
    private Parcel parcel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParcelStatus status;

    @ManyToOne
    @JoinColumn(name = "changed_by_user_id")
    private User changedBy;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;

    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        this.changedAt = LocalDateTime.now();
    }
}
