import React from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import type { Parcel } from "../types/parcel";

interface UnassignedParcelsSectionProps {
  parcels: Parcel[];
  onDataChanged: () => void;
}

export const UnassignedParcelsSection: React.FC<
  UnassignedParcelsSectionProps
> = ({ parcels, onDataChanged }) => {
  const { addToast } = useToast();

  const handleAssign = async (trackingNumber: string) => {
    try {
      await api.put(`/parcels/${trackingNumber}/assign`);
      addToast("Paczka przypisana! Status: Wydana do doręczenia.", "success");
      onDataChanged();
    } catch {
      addToast("Błąd przypisywania paczki", "error");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow border-t-4 border-gray-400">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Paczki oczekujące (Do przypisania)
      </h2>
      {parcels.length === 0 ? (
        <p className="text-gray-500">Brak nowych paczek w systemie.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parcels.map((p) => (
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
  );
};
