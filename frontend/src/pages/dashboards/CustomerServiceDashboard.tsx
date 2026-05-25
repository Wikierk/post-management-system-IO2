import React, { useState } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";

export const CustomerServiceDashboard: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.get(`/parcels/${trackingNumber}`);
      setParcel(res.data);
    } catch {
      alert("Nie znaleziono paczki!");
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
      alert("Błąd pobierania PDF");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow border-t-4 border-blue-400">
      <h2 className="text-xl font-bold mb-4 text-blue-800">
        Obsługa Klienta (Okienko)
      </h2>

      <form onSubmit={handleSearch} className="flex space-x-2 mb-6">
        <input
          type="text"
          placeholder="Zeskanuj/wpisz nr paczki..."
          className="px-4 py-2 border rounded flex-1 uppercase"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Szukaj Paczki
        </button>
      </form>

      {parcel && (
        <div className="p-4 bg-blue-50 rounded border border-blue-100">
          <h3 className="font-bold text-lg">{parcel.trackingNumber}</h3>
          <p>
            Status:{" "}
            <span className="font-bold text-blue-700">{parcel.status}</span>
          </p>
          <p>Odbiorca: {parcel.receiverName}</p>

          <div className="mt-4 space-x-3 flex">
            <button
              onClick={handleDownloadLabel}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              Pobierz Etykietę PDF
            </button>
            <button
              onClick={async () => {
                await api.put(`/parcels/${parcel.trackingNumber}/next-state`);
                handleSearch(new Event("submit") as unknown as React.FormEvent);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Wydaj Paczkę (Next State)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
