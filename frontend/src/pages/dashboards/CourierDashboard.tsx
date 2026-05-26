import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";
import { useToast } from "../../context/ToastContext";
import { ParcelDetailsModal } from "../../components/ParcelDetailsModal";

export const CourierDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [unassignedParcels, setUnassignedParcels] = useState<Parcel[]>([]);
  const [myRouteParcels, setMyRouteParcels] = useState<Parcel[]>([]);
  const [selectedParcelForDetails, setSelectedParcelForDetails] = useState<
    string | null
  >(null);

  // NOWOŚĆ: Stan dla zaznaczonych paczek (Checkboxy)
  const [selectedParcels, setSelectedParcels] = useState<string[]>([]);

  const fetchParcels = async () => {
    try {
      const unassignedRes = await api.get("/parcels/unassigned");
      setUnassignedParcels(unassignedRes.data);
      const myRouteRes = await api.get("/parcels/courier");
      // Ukrywamy paczki już dostarczone z trasy
      setMyRouteParcels(
        myRouteRes.data.filter(
          (p: Parcel) => !["DELIVERED", "RETURNED"].includes(p.status || ""),
        ),
      );
    } catch (error) {
      addToast("Błąd ładowania paczek", "error");
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  // Checkboxy logic
  const toggleParcelSelection = (trackingNumber: string) => {
    setSelectedParcels((prev) =>
      prev.includes(trackingNumber)
        ? prev.filter((t) => t !== trackingNumber)
        : [...prev, trackingNumber],
    );
  };

  const toggleAll = () => {
    if (selectedParcels.length === myRouteParcels.length)
      setSelectedParcels([]);
    else setSelectedParcels(myRouteParcels.map((p) => p.trackingNumber!));
  };

  // --- AKCJE KURIERA ---
  const handleAssign = async (trackingNumber: string) => {
    try {
      await api.put(`/parcels/${trackingNumber}/assign`);
      addToast("Paczka przypisana! Status: Wydana do doręczenia.", "success");
      fetchParcels();
    } catch {
      addToast("Błąd przypisywania paczki", "error");
    }
  };

  const setExplicitStatus = async (trackingNumber: string, status: string) => {
    try {
      await api.put(
        `/parcels/${trackingNumber}/override-status?status=${status}`,
      );
      addToast(`Zaktualizowano paczkę na: ${status}`, "success");
      fetchParcels();
    } catch {
      addToast("Błąd zmiany statusu", "error");
    }
  };

  const handleBulkDeliver = async () => {
    if (selectedParcels.length === 0) return;
    if (
      !window.confirm(
        `Czy na pewno oznaczyć ${selectedParcels.length} paczek jako DORĘCZONE?`,
      )
    )
      return;

    try {
      // Wysyłamy żądania równolegle dla zaznaczonych paczek
      await Promise.all(
        selectedParcels.map((tracking) =>
          api.put(`/parcels/${tracking}/override-status?status=DELIVERED`),
        ),
      );
      addToast(
        `Pomyślnie doręczono ${selectedParcels.length} paczek!`,
        "success",
      );
      setSelectedParcels([]); // Czyścimy checkboxy
      fetchParcels();
    } catch {
      addToast("Część paczek mogła nie zostać zaktualizowana.", "error");
      fetchParcels();
    }
  };

  return (
    <div className="space-y-8 min-h-[600px]">
      {selectedParcelForDetails && (
        <ParcelDetailsModal
          trackingNumber={selectedParcelForDetails}
          onClose={() => setSelectedParcelForDetails(null)}
        />
      )}

      {/* SEKCJA TRASY KURIERA */}
      <div className="bg-white p-6 rounded shadow border-t-4 border-yellow-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-yellow-800">
            Moja Trasa (Wydane do doręczenia)
          </h2>
          {selectedParcels.length > 0 && (
            <button
              onClick={handleBulkDeliver}
              className="px-6 py-2 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 animate-pulse"
            >
              Doręcz Zaznaczone ({selectedParcels.length})
            </button>
          )}
        </div>

        {myRouteParcels.length === 0 ? (
          <p className="text-gray-500">Brak aktywnych paczek na trasie.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b text-center">
                    <input
                      type="checkbox"
                      className="w-5 h-5 cursor-pointer"
                      onChange={toggleAll}
                      checked={
                        selectedParcels.length === myRouteParcels.length &&
                        myRouteParcels.length > 0
                      }
                    />
                  </th>
                  <th className="p-3 border-b">Paczka</th>
                  <th className="p-3 border-b">Adres Dostawy</th>
                  <th className="p-3 border-b text-right">Akcja Jawna</th>
                </tr>
              </thead>
              <tbody>
                {myRouteParcels.map((p) => (
                  <tr
                    key={p.trackingNumber}
                    className="hover:bg-yellow-50 border-b"
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 cursor-pointer"
                        checked={selectedParcels.includes(p.trackingNumber!)}
                        onChange={() =>
                          toggleParcelSelection(p.trackingNumber!)
                        }
                      />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          setSelectedParcelForDetails(p.trackingNumber!)
                        }
                        className="font-black text-blue-700 hover:underline"
                      >
                        {p.trackingNumber}
                      </button>
                      <div className="text-xs text-gray-500 font-bold uppercase">
                        {p.status}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-gray-800">
                        {p.receiverName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {p.receiverAddress}
                      </div>
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() =>
                          setExplicitStatus(p.trackingNumber!, "DELIVERED")
                        }
                        className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded shadow hover:bg-green-700"
                      >
                        DORĘCZ
                      </button>
                      <button
                        onClick={() =>
                          setExplicitStatus(p.trackingNumber!, "RETURNED")
                        }
                        className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded shadow hover:bg-red-700"
                      >
                        ZWROT / AWIZO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SEKCJA OCZEKUJĄCYCH */}
      <div className="bg-white p-6 rounded shadow border-t-4 border-gray-400">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Paczki oczekujące (Do przypisania)
        </h2>
        {unassignedParcels.length === 0 ? (
          <p className="text-gray-500">Brak nowych paczek w systemie.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedParcels.map((p) => (
              <li
                key={p.trackingNumber}
                className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 hover:border-blue-300 transition"
              >
                <div>
                  <div className="font-bold text-gray-800">
                    {p.trackingNumber}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p.receiverAddress}
                  </div>
                </div>
                <button
                  onClick={() => handleAssign(p.trackingNumber!)}
                  className="px-4 py-2 text-sm font-bold text-blue-700 border-2 border-blue-200 rounded hover:bg-blue-100"
                >
                  Pobierz
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
