package org.IO2.backend.parcel.model;

import jakarta.persistence.*;
import lombok.*;
import org.IO2.backend.model.User;
import org.IO2.backend.parcel.state.ParcelState;
import org.IO2.backend.parcel.state.StateFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "parcels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Parcel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String trackingNumber;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    private String receiverName;
    private String receiverEmail;
    private String receiverAddress;

    @Enumerated(EnumType.STRING)
    private ParcelSize size;

    private Double weight;
    private Boolean isPriority;
    private Boolean isInsured;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private ParcelStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void nextState() {
        ParcelState currentState = StateFactory.getState(this.status);
        currentState.next(this);
    }

    public void previousState() {
        ParcelState currentState = StateFactory.getState(this.status);
        currentState.previous(this);
    }
}
