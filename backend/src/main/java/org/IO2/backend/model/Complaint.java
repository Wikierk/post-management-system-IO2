package org.IO2.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.IO2.backend.parcel.model.Parcel;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parcel_id", nullable = false)
    private Parcel parcel;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User submittedBy;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    private String status;

    private LocalDateTime submittedAt;

    @Column(length = 1000)
    private String adminResponse;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}
