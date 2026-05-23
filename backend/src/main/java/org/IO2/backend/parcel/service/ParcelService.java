package org.IO2.backend.parcel.service;

import lombok.RequiredArgsConstructor;
import org.IO2.backend.model.User;
import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelStatus;
import org.IO2.backend.parcel.repository.ParcelRepository;
import org.IO2.backend.parcel.strategy.PricingStrategy;
import org.IO2.backend.parcel.strategy.PricingStrategyFactory;
import org.IO2.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParcelService {

    private final ParcelRepository parcelRepository;
    private final UserRepository userRepository;

    public Parcel createParcel(Parcel request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono nadawcy"));

        PricingStrategy pricingStrategy = PricingStrategyFactory.getStrategy(request.getSize());
        request.setPrice(pricingStrategy.calculatePrice(request.getWeight(), request.getIsPriority(), request.getIsInsured()));

        request.setSender(sender);
        request.setStatus(ParcelStatus.CREATED);
        request.setTrackingNumber(UUID.randomUUID().toString().substring(0, 10).toUpperCase()); // Generowanie numeru

        return parcelRepository.save(request);
    }

    public Parcel getParcelByTracking(String trackingNumber) {
        return parcelRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono paczki"));
    }

    public List<Parcel> getMyParcels(String email) {
        return parcelRepository.findBySenderEmail(email);
    }

    public Parcel advanceStatus(String trackingNumber) {
        Parcel parcel = getParcelByTracking(trackingNumber);

        parcel.nextState();

        return parcelRepository.save(parcel);
    }

    public List<Parcel> getAllParcels() {
        return parcelRepository.findAll();
    }
}

