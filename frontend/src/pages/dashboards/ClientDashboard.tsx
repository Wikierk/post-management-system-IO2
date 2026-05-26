import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { ParcelDetailsModal } from "../../components/ParcelDetailsModal";

interface Complaint {
  id: number;
  parcel: { trackingNumber: string };
  reason: string;
  status: string;
  adminResponse?: string;
}

export const ClientDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "ACTIVE" | "ARCHIVE" | "COMPLAINTS" | "PROFILE"
  >("ACTIVE");

  // Stany
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcelForDetails, setSelectedParcelForDetails] = useState<
    string | null
  >(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Stany reklamacji
  const [complaintReason, setComplaintReason] = useState("");
  const [selectedParcel, setSelectedParcel] = useState("");
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);

  const fetchData = async () => {
    try {
      const resParcels = await api.get("/parcels/my");
      setParcels(resParcels.data);
      const resProfile = await api.get("/profile");
      setProfile(resProfile.data);

      const resComplaints = await api.get("/complaints/my");
      setMyComplaints(resComplaints.data);
    } catch {
      addToast("Błąd pobierania danych", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Podział na aktywne i archiwalne
  const activeParcels = parcels.filter(
    (p) => !["DELIVERED", "RETURNED"].includes(p.status || ""),
  );
  const archivedParcels = parcels.filter((p) =>
    ["DELIVERED", "RETURNED"].includes(p.status || ""),
  );

  // Akcje
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/complaints", {
        trackingNumber: selectedParcel,
        reason: complaintReason,
      });
      addToast("Zgłoszenie wysłane pomyślnie!", "success");
      setComplaintReason("");
      fetchData();
    } catch {
      addToast("Błąd wysyłania zgłoszenia.", "error");
    }
  };

  const handleClientPayment = async (trackingNumber: string) => {
    try {
      await api.put(`/parcels/${trackingNumber}/pay/client`);
      addToast("Płatność przebiegła pomyślnie!", "success");
      fetchData();
    } catch {
      addToast("Wystąpił błąd podczas płatności.", "error");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/profile", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        password: profile.password || undefined,
      });
      addToast("Profil zaktualizowany!", "success");
    } catch {
      addToast("Błąd aktualizacji profilu.", "error");
    }
  };

  return (
    <div className="bg-white rounded shadow min-h-[600px] border-t-4 border-blue-600">
      {selectedParcelForDetails && (
        <ParcelDetailsModal
          trackingNumber={selectedParcelForDetails}
          onClose={() => setSelectedParcelForDetails(null)}
        />
      )}

      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-2xl font-bold text-blue-800">Panel Klienta</h2>
        <Link
          to="/create-parcel"
          className="px-6 py-2 text-white bg-green-600 rounded font-bold shadow hover:bg-green-700"
        >
          Nadaj Nową Paczkę
        </Link>
      </div>

      {/* ZAKŁADKI */}
      <div className="flex border-b overflow-x-auto bg-gray-50">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`px-6 py-3 font-bold text-sm ${activeTab === "ACTIVE" ? "border-b-4 border-blue-600 text-blue-800" : "text-gray-500"}`}
        >
          Aktywne Przesyłki ({activeParcels.length})
        </button>
        <button
          onClick={() => setActiveTab("ARCHIVE")}
          className={`px-6 py-3 font-bold text-sm ${activeTab === "ARCHIVE" ? "border-b-4 border-gray-600 text-gray-800" : "text-gray-500"}`}
        >
          Archiwum ({archivedParcels.length})
        </button>
        <button
          onClick={() => setActiveTab("COMPLAINTS")}
          className={`px-6 py-3 font-bold text-sm ${activeTab === "COMPLAINTS" ? "border-b-4 border-red-600 text-red-800" : "text-gray-500"}`}
        >
          Reklamacje
        </button>
        <button
          onClick={() => setActiveTab("PROFILE")}
          className={`px-6 py-3 font-bold text-sm ${activeTab === "PROFILE" ? "border-b-4 border-purple-600 text-purple-800" : "text-gray-500"}`}
        >
          Mój Profil
        </button>
      </div>

      <div className="p-6">
        {/* TAB: AKTYWNE */}
        {activeTab === "ACTIVE" && (
          <div className="space-y-4">
            {activeParcels.length === 0 ? (
              <p className="text-gray-500">Brak aktywnych paczek.</p>
            ) : (
              activeParcels.map((p) => (
                <div
                  key={p.trackingNumber}
                  className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-center bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="mb-4 md:mb-0">
                    <div className="font-black text-xl text-gray-800">
                      {p.trackingNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      Odbiorca:{" "}
                      <span className="font-semibold">{p.receiverName}</span>
                    </div>
                    <div className="text-sm font-bold mt-2 uppercase text-blue-600">
                      Status: {p.status}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() =>
                        setSelectedParcelForDetails(p.trackingNumber!)
                      }
                      className="px-4 py-2 border-2 border-blue-600 text-blue-600 font-bold rounded hover:bg-blue-50"
                    >
                      Szczegóły
                    </button>
                    {p.status === "CREATED" && (
                      <button
                        onClick={() => handleClientPayment(p.trackingNumber!)}
                        className="px-4 py-2 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600 shadow"
                      >
                        Opłać {p.price} PLN
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: ARCHIWUM */}
        {activeTab === "ARCHIVE" && (
          <div className="space-y-4 opacity-80">
            {archivedParcels.length === 0 ? (
              <p className="text-gray-500">Archiwum jest puste.</p>
            ) : (
              archivedParcels.map((p) => (
                <div
                  key={p.trackingNumber}
                  className="p-4 border rounded-lg flex justify-between items-center bg-gray-50"
                >
                  <div>
                    <div className="font-black text-lg text-gray-700">
                      {p.trackingNumber}
                    </div>
                    <div className="text-sm font-bold text-gray-500">
                      Zakończono: {p.status}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedParcelForDetails(p.trackingNumber!)
                    }
                    className="px-4 py-2 border border-gray-400 text-gray-600 font-bold rounded hover:bg-gray-200"
                  >
                    Podgląd
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: REKLAMACJE */}
        {activeTab === "COMPLAINTS" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lewa kolumna: Formularz */}
            <div className="bg-red-50 p-6 rounded border border-red-200 h-fit">
              <h3 className="text-lg font-bold text-red-700 mb-4">
                Zgłoś problem z paczką
              </h3>
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <select
                  required
                  className="w-full px-3 py-2 border rounded bg-white"
                  value={selectedParcel}
                  onChange={(e) => setSelectedParcel(e.target.value)}
                >
                  <option value="" disabled>
                    Wybierz paczkę do reklamacji...
                  </option>
                  {parcels
                    .filter((p) => p.status !== "IN_COMPLAINT")
                    .map((p) => (
                      <option key={p.trackingNumber} value={p.trackingNumber}>
                        {p.trackingNumber}
                      </option>
                    ))}
                </select>
                <textarea
                  required
                  placeholder="Opisz dokładnie problem..."
                  className="w-full px-3 py-2 border rounded h-32 bg-white"
                  value={complaintReason}
                  onChange={(e) => setComplaintReason(e.target.value)}
                ></textarea>
                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 text-white font-bold rounded shadow hover:bg-red-700 transition"
                >
                  Wyślij Zgłoszenie
                </button>
              </form>
            </div>

            {/* Prawa kolumna: Historia zgłoszeń klienta */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Twoje zgłoszenia
              </h3>
              {myComplaints.length === 0 ? (
                <p className="text-gray-500 italic">
                  Nie masz jeszcze żadnych zgłoszeń reklamacyjnych.
                </p>
              ) : (
                <ul className="space-y-4">
                  {myComplaints.map((c) => (
                    <li
                      key={c.id}
                      className="p-4 border rounded-lg bg-white shadow-sm flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-2 border-b pb-2">
                        <div>
                          <span className="font-bold text-gray-800">
                            Paczka: {c.parcel.trackingNumber}
                          </span>
                          {c.status === "PENDING" && (
                            <span className="ml-3 text-xs font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded uppercase">
                              Oczekuje na rozpatrzenie
                            </span>
                          )}
                          {c.status === "ACCEPTED" && (
                            <span className="ml-3 text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded uppercase">
                              Uznana
                            </span>
                          )}
                          {c.status === "REJECTED" && (
                            <span className="ml-3 text-xs font-bold bg-red-100 text-red-800 px-2 py-1 rounded uppercase">
                              Odrzucona
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-semibold">Zgłoszenie:</span>{" "}
                        {c.reason}
                      </div>

                      {/* Wyświetlanie odpowiedzi od Admina, jeśli istnieje */}
                      {c.status !== "PENDING" && (
                        <div className="mt-2 p-3 bg-gray-50 border-l-4 border-gray-400 rounded text-sm">
                          <span className="font-bold text-gray-700 block mb-1">
                            Decyzja Administracji:
                          </span>
                          <span className="text-gray-800 italic">
                            {c.adminResponse ||
                              "Brak dodatkowego uzasadnienia."}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* TAB: PROFIL */}
        {activeTab === "PROFILE" && (
          <form
            onSubmit={handleProfileUpdate}
            className="max-w-md space-y-4 bg-gray-50 p-6 rounded border"
          >
            <h3 className="font-bold text-lg mb-4 text-purple-800">
              Moje Dane i Zabezpieczenia
            </h3>
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Email (Login)
              </label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Imię
              </label>
              <input
                type="text"
                required
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Nazwisko
              </label>
              <input
                type="text"
                required
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="pt-4 border-t">
              <label className="block text-sm font-bold text-red-700">
                Nowe Hasło (Zostaw puste by nie zmieniać)
              </label>
              <input
                type="password"
                placeholder="Wpisz nowe hasło..."
                onChange={(e) =>
                  setProfile({ ...profile, password: e.target.value })
                }
                className="w-full px-3 py-2 border rounded border-red-300"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-purple-600 text-white font-bold rounded shadow hover:bg-purple-700"
            >
              Zapisz Zmiany
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
