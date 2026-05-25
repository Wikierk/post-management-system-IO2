import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";

export const CourierDashboard: React.FC = () => {
  const [assignedParcels, setAssignedParcels] = useState<Parcel[]>([]);

  const fetchParcels = async () => {
    try {
      // TODO w kolejnym kroku na backendzie dodamy endpoint /parcels/courier, na razie używamy /all
      const res = await api.get("/parcels/all");
      // Filtrujemy tylko te w trakcie dostawy (tymczasowe dla kuriera)
      setAssignedParcels(
        res.data.filter(
          (p: Parcel) =>
            p.status === "OUT_FOR_DELIVERY" || p.status === "IN_SORTING",
        ),
      );
    } catch (error) {
      console.error("Błąd", error);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleDeliver = async (trackingNumber: string) => {
    try {
      await api.put(`/parcels/${trackingNumber}/next-state`);
      fetchParcels();
    } catch (error) {
      alert("Błąd aktualizacji statusu");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow border-t-4 border-yellow-500">
      <h2 className="text-xl font-bold mb-4 text-yellow-800">
        Panel Kuriera: Trasa na dziś
      </h2>

      {assignedParcels.length === 0 ? (
        <p>Brak paczek przypisanych na dziś.</p>
      ) : (
        <ul className="space-y-3">
          {assignedParcels.map((p) => (
            <li
              key={p.trackingNumber}
              className="p-4 border rounded flex justify-between items-center bg-yellow-50"
            >
              <div>
                <div className="font-bold">{p.trackingNumber}</div>
                <div className="text-sm">Adres: {p.receiverAddress}</div>
                <div className="text-xs text-gray-600">Status: {p.status}</div>
              </div>
              <button
                onClick={() => handleDeliver(p.trackingNumber!)}
                className="px-4 py-2 text-white bg-yellow-600 rounded hover:bg-yellow-700"
              >
                Zaktualizuj Status
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
