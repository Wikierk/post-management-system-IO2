import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";
import { useToast } from "../../context/ToastContext";
import { Tabs } from "../../components/Tabs";

interface Branch {
  id: number;
  name: string;
  address: string;
  type: string;
}

export const CustomerServiceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "WALK_IN" | "PAYMENT_LABEL" | "MANUAL_STATUS"
  >("PAYMENT_LABEL");
  const [branches, setBranches] = useState<Branch[]>([]);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  
  // Zmieniony stan - rozbity adres odbiorcy
  const [walkInForm, setWalkInForm] = useState({
    senderFirstName: "",
    senderLastName: "",
    senderEmail: "",
    receiverName: "",
    receiverEmail: "",
    receiverStreet: "",
    receiverCity: "",
    receiverPostalCode: "",
    size: "SMALL",
    weight: 1.0,
    isPriority: false,
    isInsured: false,
  });
  
  const [selectedStatus, setSelectedStatus] = useState("IN_SORTING");
  const [selectedBranchId, setSelectedBranchId] = useState<number | "">("");
  const { addToast } = useToast();

  useEffect(() => {
    api.get("/branches").then((res) => setBranches(res.data));
  }, []);

  const handleSearch = async (e?: React.FormEvent, trackingOverride?: string) => {
    if (e) e.preventDefault();
    const tn = trackingOverride ?? trackingNumber;
    try {
      const res = await api.get(`/parcels/${tn}`);
      setParcel(res.data);
      // keep the input in sync when an override is used
      if (trackingOverride) setTrackingNumber(tn);
    } catch {
      addToast(
        "Nie znaleziono paczki o podanym numerze lub wystąpił błąd.",
        "error",
      );
      setParcel(null);
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Połączenie adresu przed wysłaniem do backendu
    const combinedReceiverAddress = `${walkInForm.receiverStreet.trim()}, ${walkInForm.receiverCity.trim()}, ${walkInForm.receiverPostalCode.trim()}`;

    try {
      const payload = {
        senderFirstName: walkInForm.senderFirstName,
        senderLastName: walkInForm.senderLastName,
        senderEmail: walkInForm.senderEmail,
        parcelData: {
          receiverName: walkInForm.receiverName,
          receiverEmail: walkInForm.receiverEmail,
          receiverAddress: combinedReceiverAddress,
          size: walkInForm.size,
          weight: walkInForm.weight,
          isPriority: walkInForm.isPriority,
          isInsured: walkInForm.isInsured,
        },
      };
      const res = await api.post("/parcels/walk-in", payload);
      addToast(
        "Paczka zarejestrowana! Przekaż klientowi numer trackingowy i kwotę do zapłaty.",
        "success",
      );
      setTrackingNumber(res.data.trackingNumber);
      setActiveTab("PAYMENT_LABEL");
      await handleSearch(undefined, res.data.trackingNumber);
      
      // Czyszczenie formularza po sukcesie
      setWalkInForm({
        senderFirstName: "",
        senderLastName: "",
        senderEmail: "",
        receiverName: "",
        receiverEmail: "",
        receiverStreet: "",
        receiverCity: "",
        receiverPostalCode: "",
        size: "SMALL",
        weight: 1.0,
        isPriority: false,
        isInsured: false,
      });
    } catch (err) {
      addToast(
        "Błąd rejestracji paczki. Sprawdź dane i spróbuj ponownie.",
        "error",
      );
    }
  };

  const handlePayment = async () => {
    try {
      await api.put(`/parcels/${parcel?.trackingNumber}/pay`);
      addToast("Płatność zaksięgowana pomyślnie!", "success");
      handleSearch(); // Odśwież widok
    } catch (err) {
      addToast("Błąd płatności", "error");
    }
  };

  const handleDownloadLabel = async () => {
    try {
      const response = await api.get(
        `/parcels/${parcel?.trackingNumber}/label`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `etykieta_${parcel?.trackingNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      addToast("Błąd pobierania PDF", "error");
    }
  };

  const handleOverrideStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcel) return;
    try {
      const branchParam = selectedBranchId
        ? `&branchId=${selectedBranchId}`
        : "";
      await api.put(
        `/parcels/${parcel.trackingNumber}/override-status?status=${selectedStatus}${branchParam}`,
      );
      addToast("Status paczki został ręcznie zaktualizowany!", "success");
      handleSearch();
    } catch (err) {
      addToast("Błąd przy aktualizacji statusu.", "error");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow border-t-4 border-blue-400 min-h-[600px]">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">
        Stanowisko Obsługi Klienta (Okienko)
      </h2>
      <Tabs
        items={[
          { key: "PAYMENT_LABEL", label: "Obsługa Bieżąca / Płatności" },
          { key: "WALK_IN", label: "Nowy Nadawca (Z Ulicy)" },
          { key: "MANUAL_STATUS", label: "Awaria / Ręczna Zmiana Statusu" },
        ]}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as any)}
      />
      <div className="p-6">
        {activeTab === "PAYMENT_LABEL" && (
          <div className="space-y-6 max-w-2xl bg-blue-50 rounded-b">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                placeholder="Zeskanuj/wpisz nr paczki..."
                required
                className="px-4 py-2 border rounded flex-1 uppercase font-mono text-lg"
                value={trackingNumber}
                onChange={(e) =>
                  setTrackingNumber(e.target.value.toUpperCase())
                }
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded font-bold"
              >
                Szukaj
              </button>
            </form>

            {parcel && (
              <div className="p-6 bg-blue-50 rounded border border-blue-200">
                <h3 className="font-bold text-2xl mb-2">
                  {parcel.trackingNumber}
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Status:</p>
                    <p className="font-bold text-lg text-blue-700">
                      {parcel.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Do zapłaty:</p>
                    <p className="font-bold text-lg">{parcel.price} PLN</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600 text-sm">Odbiorca:</p>
                    <p className="font-medium">
                      {parcel.receiverName} ({parcel.receiverAddress})
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-blue-200 flex space-x-4">
                  {parcel.status === "CREATED" ? (
                    <button
                      onClick={handlePayment}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow text-center"
                    >
                      Pobierz Opłatę: {parcel.price} PLN
                    </button>
                  ) : (
                    <button
                      onClick={handleDownloadLabel}
                      className="flex-1 px-4 py-3 bg-gray-800 text-white rounded font-bold hover:bg-gray-900 shadow text-center"
                    >
                      Wydrukuj Etykietę PDF
                    </button>
                  )}
                </div>
                {parcel.status === "CREATED" && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    Etykieta będzie dostępna dopiero po opłaceniu przesyłki.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* TAB: NOWY KLIENT */}
        {activeTab === "WALK_IN" && (
          <form
            onSubmit={handleWalkInSubmit}
            className="space-y-6 max-w-4xl bg-gray-50 p-6 rounded-b border-x border-b"
          >
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4 text-green-800 border-b pb-2">
                  1. Dane Nadawcy (Z dowodu)
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Imię"
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={walkInForm.senderFirstName}
                    onChange={(e) =>
                      setWalkInForm({
                        ...walkInForm,
                        senderFirstName: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Nazwisko"
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={walkInForm.senderLastName}
                    onChange={(e) =>
                      setWalkInForm({
                        ...walkInForm,
                        senderLastName: e.target.value,
                      })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email (Na ten adres przyjdzie dostęp do konta)"
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={walkInForm.senderEmail}
                    onChange={(e) =>
                      setWalkInForm({
                        ...walkInForm,
                        senderEmail: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-4 text-blue-800 border-b pb-2">
                  2. Dane Odbiorcy
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Imię i Nazwisko"
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={walkInForm.receiverName}
                    onChange={(e) =>
                      setWalkInForm({
                        ...walkInForm,
                        receiverName: e.target.value,
                      })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email Odbiorcy"
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={walkInForm.receiverEmail}
                    onChange={(e) =>
                      setWalkInForm({
                        ...walkInForm,
                        receiverEmail: e.target.value,
                      })
                    }
                  />
                  
                  {/* Rozdzielone pola adresu */}
                  <input
                    type="text"
                    placeholder="Ulica i numer budynku/lokalu"
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={walkInForm.receiverStreet}
                    onChange={(e) =>
                      setWalkInForm({
                        ...walkInForm,
                        receiverStreet: e.target.value,
                      })
                    }
                  />
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Miasto"
                      required
                      className="w-full px-3 py-2 border rounded w-2/3"
                      value={walkInForm.receiverCity}
                      onChange={(e) =>
                        setWalkInForm({
                          ...walkInForm,
                          receiverCity: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Kod pocztowy"
                      required
                      className="w-full px-3 py-2 border rounded w-1/3"
                      value={walkInForm.receiverPostalCode}
                      onChange={(e) =>
                        setWalkInForm({
                          ...walkInForm,
                          receiverPostalCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
              3. Parametry Paczki
            </h3>
            <div className="grid grid-cols-4 gap-4 items-center">
              <select
                className="px-3 py-2 border rounded"
                value={walkInForm.size}
                onChange={(e) =>
                  setWalkInForm({ ...walkInForm, size: e.target.value })
                }
              >
                <option value="SMALL">Mała (Koperta)</option>
                <option value="MEDIUM">Średnia (Paczka)</option>
                <option value="LARGE">Duży Gabaryt</option>
              </select>
              <input
                type="number"
                step="0.1"
                placeholder="Waga (kg)"
                required
                className="px-3 py-2 border rounded"
                value={walkInForm.weight}
                onChange={(e) =>
                  setWalkInForm({
                    ...walkInForm,
                    weight: parseFloat(e.target.value),
                  })
                }
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 w-5 h-5"
                  checked={walkInForm.isPriority}
                  onChange={(e) =>
                    setWalkInForm({
                      ...walkInForm,
                      isPriority: e.target.checked,
                    })
                  }
                />{" "}
                Priorytet
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 w-5 h-5"
                  checked={walkInForm.isInsured}
                  onChange={(e) =>
                    setWalkInForm({
                      ...walkInForm,
                      isInsured: e.target.checked,
                    })
                  }
                />{" "}
                Ubezpieczenie
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 shadow-lg"
            >
              Zarejestruj Przesyłkę w Systemie
            </button>
          </form>
        )}
        
        {/* TAB: RĘCZNA EDYCJA I PLACÓWKA */}
        {activeTab === "MANUAL_STATUS" && (
          <div className="space-y-6 max-w-2xl bg-red-50 p-6 rounded-b border-x border-b border-red-200">
            <p className="text-sm text-red-700 mb-4 font-semibold">
              UWAGA: Używasz modułu ręcznego nadpisywania statusu. 
              Powinien on być używany tylko w wyjątkowych sytuacjach, takich jak 
              awarie systemu lub błędne skanowanie.
            </p>

            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                placeholder="Wyszukaj paczkę..."
                required
                className="px-4 py-2 border rounded flex-1 uppercase font-mono"
                value={trackingNumber}
                onChange={(e) =>
                  setTrackingNumber(e.target.value.toUpperCase())
                }
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-800 text-white rounded"
              >
                Wczytaj
              </button>
            </form>

            {parcel && (
              <form
                onSubmit={handleOverrideStatus}
                className="mt-6 space-y-4 border-t border-red-200 pt-6"
              >
                <div>
                  <p className="text-gray-600 text-sm">
                    Aktualny status paczki:{" "}
                    <span className="font-bold text-black">
                      {parcel.status}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Nowy Status
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="CREATED">CREATED (Utworzona)</option>
                    <option value="PAID">PAID (Opłacona)</option>
                    <option value="IN_SORTING">
                      IN_SORTING (W Sortowni / Oddziale)
                    </option>
                    <option value="OUT_FOR_DELIVERY">
                      OUT_FOR_DELIVERY (Wydana kurierowi)
                    </option>
                    <option value="DELIVERED">DELIVERED (Doręczona)</option>
                    <option value="RETURNED">
                      RETURNED (Zwrócona / Awizo)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Lokalizacja fizyczna paczki (Opcjonalnie)
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={selectedBranchId}
                    onChange={(e) =>
                      setSelectedBranchId(Number(e.target.value))
                    }
                  >
                    <option value="">-- Brak / Nie dotyczy --</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.address})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 text-white rounded font-bold hover:bg-red-700"
                >
                  WYMUŚ AKTUALIZACJĘ SYSTEMU
                </button>
              </form>
            )}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};