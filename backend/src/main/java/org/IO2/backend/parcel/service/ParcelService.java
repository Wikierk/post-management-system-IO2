package org.IO2.backend.parcel.service;

import org.IO2.backend.model.Pricing;
import org.IO2.backend.model.User;
import org.IO2.backend.parcel.event.ParcelStatusChangedEvent;
import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelHistory;
import org.IO2.backend.parcel.model.ParcelStatus;
import org.IO2.backend.parcel.repository.ParcelHistoryRepository;
import org.IO2.backend.parcel.repository.ParcelRepository;
import org.IO2.backend.parcel.repository.PricingRepository;
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
    private final PricingRepository pricingRepository;
    private final ParcelHistoryRepository parcelHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Parcel createParcel(Parcel request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail).orElseThrow();

        // 1. Pobieramy cennik z BAZY DANYCH dla danego gabarytu
        Pricing pricing = pricingRepository.findBySize(request.getSize())
                .orElseThrow(() -> new RuntimeException("Brak cennika dla tego gabarytu!"));

        // 2. Wzorzec Strategii używa cennika z bazy
        PricingStrategy pricingStrategy = PricingStrategyFactory.getStrategy(request.getSize());
        request.setPrice(pricingStrategy.calculatePrice(request.getWeight(), request.getIsPriority(), request.getIsInsured(), pricing));

        request.setSender(sender);
        request.setStatus(ParcelStatus.CREATED);
        request.setTrackingNumber(UUID.randomUUID().toString().substring(0, 10).toUpperCase());

        Parcel savedParcel = parcelRepository.save(request);
        saveHistory(savedParcel, sender); // Logujemy utworzenie
        return savedParcel;
    }

    public Parcel getParcelByTracking(String trackingNumber) { return parcelRepository.findByTrackingNumber(trackingNumber).orElseThrow(); }
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
    public Parcel advanceStatus(String trackingNumber, String userEmail) {
        Parcel parcel = getParcelByTracking(trackingNumber);
        User user = userRepository.findByEmail(userEmail).orElse(null);

        parcel.nextState(); // Zmiana statusu przez Wzorzec State
        Parcel savedParcel = parcelRepository.save(parcel);

        saveHistory(savedParcel, user); // Zapisujemy nową historię w bazie!

        eventPublisher.publishEvent(new ParcelStatusChangedEvent(this, savedParcel.getTrackingNumber(), savedParcel.getReceiverEmail(), savedParcel.getStatus()));
        return savedParcel;
    }

    // Nowa metoda pomocnicza do tworzenia wpisów w historii
    public void saveHistory(Parcel parcel, User user) {
        ParcelHistory history = ParcelHistory.builder()
                .parcel(parcel)
                .status(parcel.getStatus())
                .changedBy(user)
                // .branch(...) - dodamy w Fazie 3 dla pracownika okienka
                .build();
        parcelHistoryRepository.save(history);
    }
}


