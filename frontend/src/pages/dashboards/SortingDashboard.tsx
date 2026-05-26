import React, { useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

export const SortingDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [scannedParcels, setScannedParcels] = useState<
    { number: string; time: string }[]
  >([]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber) return;

    try {
      await api.put(`/parcels/${trackingNumber}/next-state`);
      addToast(`Paczka ${trackingNumber} zeskanowana pomyślnie!`, "success");

      // Dodaj do lokalnej historii z godziną
      const now = new Date().toLocaleTimeString("pl-PL");
      setScannedParcels((prev) =>
        [{ number: trackingNumber, time: now }, ...prev].slice(0, 10),
      ); // Pamiętaj 10 ostatnich

      setTrackingNumber(""); // Wyczyść pole dla następnego skanowania
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.status === 500) {
        addToast("Konflikt wersji (Optimistic Lock).", "error");
      } else {
        addToast(
          `Błąd! Sprawdź czy paczka ${trackingNumber} istnieje i nie jest zablokowana.`,
          "error",
        );
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow border-t-8 border-purple-600 max-w-2xl mx-auto">
      <h2 className="text-2xl font-black mb-2 text-purple-800 text-center">
        Skaner Sortowni
      </h2>
      <p className="mb-8 text-gray-500 text-center text-sm">
        System automatycznie dopisze Twoją placówkę do historii paczki po
        zeskanowaniu.
      </p>

      <form onSubmit={handleScan} className="flex flex-col space-y-4 mb-8">
        <input
          type="text"
          placeholder="Wprowadź kod kreskowy (Numer Nadania)"
          className="px-6 py-4 border-2 border-gray-300 rounded-lg text-2xl font-mono uppercase text-center focus:border-purple-600 focus:outline-none transition-colors"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
          autoFocus
        />
        <button
          type="submit"
          className="py-4 text-white bg-purple-600 rounded-lg font-bold text-xl hover:bg-purple-700 shadow-lg active:transform active:scale-95 transition"
        >
          SKANUJ PACZKĘ
        </button>
      </form>

      {scannedParcels.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="font-bold text-gray-700 mb-4">
            Ostatnio zeskanowane (Sesja bieżąca):
          </h3>
          <ul className="space-y-2">
            {scannedParcels.map((scan, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 text-sm"
              >
                <span className="font-mono font-bold text-gray-800">
                  {scan.number}
                </span>
                <span className="text-gray-500">{scan.time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
