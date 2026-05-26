package org.IO2.backend.parcel.service;

import org.IO2.backend.model.Branch;
import org.IO2.backend.model.Pricing;
import org.IO2.backend.model.Role;
import org.IO2.backend.model.User;
import org.IO2.backend.parcel.controller.ParcelController;
import org.IO2.backend.parcel.event.ParcelStatusChangedEvent;
import org.IO2.backend.parcel.model.Parcel;
import org.IO2.backend.parcel.model.ParcelHistory;
import org.IO2.backend.parcel.model.ParcelStatus;
import org.IO2.backend.parcel.repository.ParcelHistoryRepository;
import org.IO2.backend.parcel.repository.ParcelRepository;
import org.IO2.backend.parcel.repository.PricingRepository;
import org.IO2.backend.parcel.strategy.PricingStrategy;
import org.IO2.backend.parcel.strategy.PricingStrategyFactory;
import org.IO2.backend.repository.BranchRepository;
import org.IO2.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

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
        saveHistory(savedParcel, sender, null); // Logujemy utworzenie
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

        // --- NOWOŚĆ: POBRANIE PLACÓWKI Z PROFILU PRACOWNIKA ---
        Branch branch = (user != null) ? user.getAssignedBranch() : null;

        // Zapisujemy nową historię w bazie z przypiętą placówką (jeśli pracownik ją posiada)
        saveHistory(savedParcel, user, branch);

        eventPublisher.publishEvent(new ParcelStatusChangedEvent(this, savedParcel.getTrackingNumber(), savedParcel.getReceiverEmail(), savedParcel.getStatus()));
        return savedParcel;
    }

    // --- NOWA METODA: Tworzenie konta dla klienta z ulicy ---
    @Transactional
    public Parcel createWalkInParcel(Parcel request, String senderFirstName, String senderLastName, String senderEmail) {
        // Sprawdź, czy nadawca już istnieje, jeśli nie - utwórz konto techniczne
        userRepository.findByEmail(senderEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .firstName(senderFirstName)
                    .lastName(senderLastName)
                    .email(senderEmail)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Losowe, silne hasło
                    .role(Role.CLIENT)
                    .build();
            return userRepository.save(newUser);
        });

        // Wywołaj standardową metodę tworzenia paczki
        return createParcel(request, senderEmail);
    }

    // --- NOWA METODA: Opłacenie paczki w okienku ---
    @Transactional
    public Parcel payForParcel(String trackingNumber, String workerEmail) {
        Parcel parcel = getParcelByTracking(trackingNumber);
        if (parcel.getStatus() != ParcelStatus.CREATED) {
            throw new RuntimeException("Paczka nie oczekuje na opłatę.");
        }

        parcel.setStatus(ParcelStatus.PAID);
        Parcel savedParcel = parcelRepository.save(parcel);

        User worker = userRepository.findByEmail(workerEmail).orElse(null);
        saveHistory(savedParcel, worker, null); // Logujemy płatność

        return savedParcel;
    }

    // --- NOWA METODA: Ręczne nadpisanie statusu (Override) + Zapis Placówki ---
    @Transactional
    public Parcel overrideStatus(String trackingNumber, ParcelStatus newStatus, Long branchId, String workerEmail) {
        Parcel parcel = getParcelByTracking(trackingNumber);

        // Tutaj omijamy wzorzec State, bo to ręczna ingerencja uprawnionego pracownika
        parcel.setStatus(newStatus);
        Parcel savedParcel = parcelRepository.save(parcel);

        User worker = userRepository.findByEmail(workerEmail).orElse(null);
        Branch branch = branchId != null ? branchRepository.findById(branchId).orElse(null) : null;

        // Zapisujemy w historii GDZIE wystąpiła zmiana (Branch)
        saveHistory(savedParcel, worker, branch);

        // Publikujemy zdarzenie o zmianie
        eventPublisher.publishEvent(new ParcelStatusChangedEvent(this, savedParcel.getTrackingNumber(), savedParcel.getReceiverEmail(), savedParcel.getStatus()));

        return savedParcel;
    }

    // Nowa metoda pomocnicza do tworzenia wpisów w historii
    public void saveHistory(Parcel parcel, User user, Branch branch) {
        ParcelHistory history = ParcelHistory.builder()
                .parcel(parcel)
                .status(parcel.getStatus())
                .changedBy(user)
                .branch(branch) // DODANO OBSŁUGĘ PLACÓWKI
                .build();
        parcelHistoryRepository.save(history);
    }

    @Transactional
    public Parcel payForParcelClient(String trackingNumber, String clientEmail) {
        Parcel parcel = getParcelByTracking(trackingNumber);

        // Zabezpieczenie: Czy to na pewno paczka tego klienta?
        if (!parcel.getSender().getEmail().equals(clientEmail)) {
            throw new RuntimeException("Brak uprawnień. To nie jest Twoja paczka!");
        }
        if (parcel.getStatus() != ParcelStatus.CREATED) {
            throw new RuntimeException("Paczka nie oczekuje na opłatę.");
        }

        parcel.setStatus(ParcelStatus.PAID);
        Parcel savedParcel = parcelRepository.save(parcel);
        saveHistory(savedParcel, parcel.getSender(), null); // Logujemy akcję klienta

        return savedParcel;
    }

    // --- NOWA METODA: Pobieranie historii dla widoku śledzenia ---
    public List<ParcelController.HistoryDto> getParcelHistory(String trackingNumber) {
        List<ParcelHistory> historyList = parcelHistoryRepository.findByParcelTrackingNumberOrderByChangedAtDesc(trackingNumber);

        return historyList.stream().map(h -> {
            String branchInfo = (h.getBranch() != null)
                    ? h.getBranch().getName() + " (" + h.getBranch().getAddress() + ")"
                    : "Brak danych o placówce / System";

            return ParcelController.HistoryDto.builder()
                    .status(h.getStatus().name())
                    .date(h.getChangedAt().toString())
                    .branchInfo(branchInfo)
                    .build();
        }).toList();
    }
}


