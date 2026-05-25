import React, { useState } from "react";
import api from "../../api/axios";

export const SortingDashboard: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/parcels/${trackingNumber}/next-state`);
      setMessage(
        `Pomyślnie zeskanowano i zaktualizowano paczkę: ${trackingNumber}`,
      );
      setTrackingNumber(""); // czyszczenie inputu po "strzale" ze skanera
    } catch (error) {
      setMessage(`Błąd! Paczka ${trackingNumber} nie może zmienić statusu.`);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow border-t-4 border-purple-500">
      <h2 className="text-xl font-bold mb-4 text-purple-800">
        Panel Pracownika Sortowni: Skanowanie
      </h2>
      <p className="mb-4 text-gray-600">
        Wprowadź numer paczki (lub użyj skanera kodów kreskowych), aby
        przerzucić ją na kolejny etap logistyczny.
      </p>

      <form onSubmit={handleScan} className="flex space-x-2">
        <input
          type="text"
          placeholder="Numer paczki..."
          className="flex-1 px-4 py-2 border rounded text-lg font-mono uppercase"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-2 text-white bg-purple-600 rounded hover:bg-purple-700"
        >
          Skanuj
        </button>
      </form>

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-center font-medium">
          {message}
        </div>
      )}
    </div>
  );
};
