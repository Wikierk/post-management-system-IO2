import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";

export const CourierDashboard: React.FC = () => {
  const [unassignedParcels, setUnassignedParcels] = useState<Parcel[]>([]);
  const [myRouteParcels, setMyRouteParcels] = useState<Parcel[]>([]);

  const fetchParcels = async () => {
    try {
      const unassignedRes = await api.get("/parcels/unassigned");
      setUnassignedParcels(unassignedRes.data);

      const myRouteRes = await api.get("/parcels/courier");
      setMyRouteParcels(myRouteRes.data);
    } catch (error) {
      console.error("Błąd ładowania paczek", error);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleAssign = async (trackingNumber: string) => {
    try {
      await api.put(`/parcels/${trackingNumber}/assign`);
      fetchParcels();
    } catch (error) {
      alert("Błąd przypisywania paczki");
    }
  };

  const handleAdvanceStatus = async (trackingNumber: string) => {
    try {
      await api.put(`/parcels/${trackingNumber}/next-state`);
      fetchParcels();
    } catch (error: any) {
      // Obsługa OptimisticLockingFailureException
      if (error.response?.status === 409 || error.response?.status === 500) {
        alert(
          "Konflikt wersji! Ktoś inny właśnie zaktualizował tę paczkę (Działa Optimistic Locking!).",
        );
      } else {
        alert("Błąd zmiany statusu paczki.");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Sekcja: Moja Trasa */}
      <div className="bg-white p-6 rounded shadow border-t-4 border-yellow-500">
        <h2 className="text-xl font-bold mb-4 text-yellow-800">
          Moja Trasa na dziś (Moje przypisane paczki)
        </h2>
        {myRouteParcels.length === 0 ? (
          <p>Brak paczek na trasie.</p>
        ) : (
          <ul className="space-y-3">
            {myRouteParcels.map((p) => (
              <li
                key={p.trackingNumber}
                className="p-4 border rounded flex justify-between items-center bg-yellow-50"
              >
                <div>
                  <div className="font-bold">{p.trackingNumber}</div>
                  <div className="text-sm">Odbiorca: {p.receiverName}</div>
                  <div className="text-sm">Adres: {p.receiverAddress}</div>
                  <div className="text-xs font-semibold text-blue-800 mt-1">
                    Status: {p.status}
                  </div>
                </div>
                <button
                  onClick={() => handleAdvanceStatus(p.trackingNumber!)}
                  className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Dalej (Zmień status)
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sekcja: Dostępne paczki */}
      <div className="bg-white p-6 rounded shadow border-t-4 border-gray-400">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Paczki oczekujące (bez kuriera)
        </h2>
        {unassignedParcels.length === 0 ? (
          <p>Wszystkie paczki zostały przypisane.</p>
        ) : (
          <ul className="space-y-3">
            {unassignedParcels.map((p) => (
              <li
                key={p.trackingNumber}
                className="p-3 border rounded flex justify-between items-center bg-gray-50 hover:bg-gray-100"
              >
                <div>
                  <div className="font-bold text-gray-700">
                    {p.trackingNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.receiverAddress} | {p.weight} kg
                  </div>
                </div>
                <button
                  onClick={() => handleAssign(p.trackingNumber!)}
                  className="px-3 py-1 text-sm text-gray-700 border border-gray-400 rounded hover:bg-gray-200"
                >
                  Weź paczkę
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
