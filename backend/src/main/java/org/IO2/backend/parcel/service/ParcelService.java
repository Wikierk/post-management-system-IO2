package org.IO2.backend.parcel.service;

import org.IO2.backend.model.User;
import org.IO2.backend.parcel.event.ParcelStatusChangedEvent;
import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelStatus;
import org.IO2.backend.parcel.repository.ParcelRepository;
import org.IO2.backend.parcel.strategy.PricingStrategy;
import org.IO2.backend.parcel.strategy.PricingStrategyFactory;
import org.IO2.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParcelService {

    private final ParcelRepository parcelRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public Parcel createParcel(Parcel request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail).orElseThrow();
        PricingStrategy pricingStrategy = PricingStrategyFactory.getStrategy(request.getSize());
        request.setPrice(pricingStrategy.calculatePrice(request.getWeight(), request.getIsPriority(), request.getIsInsured()));
        request.setSender(sender);
        request.setStatus(ParcelStatus.CREATED);
        request.setTrackingNumber(UUID.randomUUID().toString().substring(0, 10).toUpperCase());
        return parcelRepository.save(request);
    }

    public Parcel getParcelByTracking(String trackingNumber) {
        return parcelRepository.findByTrackingNumber(trackingNumber).orElseThrow();
    }

    public List<Parcel> getMyParcels(String email) { return parcelRepository.findBySenderEmail(email); }
    public List<Parcel> getUnassignedParcels() { return parcelRepository.findByCourierIsNull(); }
    public List<Parcel> getCourierParcels(String email) { return parcelRepository.findByCourierEmail(email); }
    public List<Parcel> getAllParcels() { return parcelRepository.findAll(); }

    @Transactional
    public Parcel assignToCourier(String trackingNumber, String courierEmail) {
        Parcel parcel = getParcelByTracking(trackingNumber);
        if (parcel.getCourier() != null) throw new RuntimeException("Paczka jest już przypisana");
        User courier = userRepository.findByEmail(courierEmail).orElseThrow();
        parcel.setCourier(courier);
        return parcelRepository.save(parcel);
    }

    @Transactional
    public Parcel advanceStatus(String trackingNumber) {
        Parcel parcel = getParcelByTracking(trackingNumber);

        parcel.nextState();
        Parcel savedParcel = parcelRepository.save(parcel);

        eventPublisher.publishEvent(new ParcelStatusChangedEvent(
                this,
                savedParcel.getTrackingNumber(),
                savedParcel.getReceiverEmail(),
                savedParcel.getStatus()
        ));

        return savedParcel;
    }


}


