import React, { useState } from "react";
import api from "../api/axios";
import type { Parcel } from "../types/parcel";
import { Link } from "react-router-dom";

export const Tracking: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setParcel(null);
    try {
      const response = await api.get(`/parcels/${trackingNumber}`);
      setParcel(response.data);
    } catch (err) {
      setError("Nie znaleziono paczki o podanym numerze.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md text-center">
        <Link
          to="/dashboard"
          className="text-sm text-blue-500 hover:underline block mb-4 text-left"
        >
          &larr; Wróć do Panelu
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Śledzenie Przesyłek
        </h1>

        <form onSubmit={handleSearch} className="flex space-x-2 mb-8">
          <input
            type="text"
            placeholder="Wpisz numer nadania..."
            required
            className="flex-1 px-4 py-2 border rounded-md"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Szukaj
          </button>
        </form>

        {error && <p className="text-red-500">{error}</p>}

        {parcel && (
          <div className="text-left bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Wyniki wyszukiwania</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-gray-600">Numer:</span>{" "}
                {parcel.trackingNumber}
              </p>
              <p>
                <span className="font-semibold text-gray-600">Odbiorca:</span>{" "}
                {parcel.receiverName}
              </p>
              <p>
                <span className="font-semibold text-gray-600">Gabaryt:</span>{" "}
                {parcel.size} ({parcel.weight} kg)
              </p>
              <p>
                <span className="font-semibold text-gray-600">Cena:</span>{" "}
                {parcel.price} zł
              </p>

              <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50">
                <p className="text-sm text-gray-600">Aktualny status:</p>
                <p className="text-2xl font-bold text-blue-800">
                  {parcel.status}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
