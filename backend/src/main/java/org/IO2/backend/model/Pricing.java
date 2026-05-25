package org.IO2.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.IO2.backend.parcel.model.ParcelSize;

import java.math.BigDecimal;

@Entity
@Table(name = "pricings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private ParcelSize size;

    @Column(nullable = false)
    private BigDecimal basePrice;

    @Column(nullable = false)
    private BigDecimal weightMultiplier; // Cena za 1 kg

    @Column(nullable = false)
    private BigDecimal priorityAddon;

    @Column(nullable = false)
    private BigDecimal insuranceAddon;
}
