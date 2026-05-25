import React, { useState } from "react";
import api from "../api/axios";
import type { Parcel } from "../types/parcel";
import { Link } from "react-router-dom";

interface HistoryRecord {
  status: string;
  date: string;
  branchInfo: string;
}

export const Tracking: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setParcel(null);
    setHistory([]);
    try {
      // Pobieramy paczkę
      const resParcel = await api.get(`/parcels/${trackingNumber}`);
      setParcel(resParcel.data);

      // Pobieramy historię logów
      const resHistory = await api.get(`/parcels/${trackingNumber}/history`);
      setHistory(resHistory.data);
    } catch (err) {
      setError("Nie znaleziono paczki o podanym numerze lub wystąpił błąd.");
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 pb-20">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-xl">
        <Link
          to="/dashboard"
          className="text-sm font-bold text-blue-500 hover:underline block mb-6"
        >
          &larr; Wróć do Systemu
        </Link>
        <h1 className="text-4xl font-black text-gray-800 mb-8 text-center border-b pb-4">
          Śledzenie Przesyłek
        </h1>

        <form onSubmit={handleSearch} className="flex space-x-3 mb-10">
          <input
            type="text"
            placeholder="Wpisz 10-znakowy numer nadania..."
            required
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-lg uppercase font-mono focus:border-blue-500 focus:outline-none transition"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
          />
          <button
            type="submit"
            className="px-8 py-3 text-white bg-blue-600 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg"
          >
            Szukaj
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {parcel && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Szczegóły - Lewa Kolumna */}
            <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Dane Przesyłki
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Numer paczki
                  </p>
                  <p className="font-mono font-bold text-lg">
                    {parcel.trackingNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Odbiorca
                  </p>
                  <p className="font-medium text-gray-800">
                    {parcel.receiverName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Gabaryt / Waga
                  </p>
                  <p className="font-medium text-gray-800">
                    {parcel.size} ({parcel.weight} kg)
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Obecny Status
                  </p>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 font-black rounded text-lg">
                    {parcel.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Oś Czasu (Timeline) - Prawa Kolumna */}
            <div className="md:col-span-2 pl-4 md:border-l-2 md:border-dashed border-gray-300">
              <h2 className="text-2xl font-black mb-6 text-gray-800">
                Historia Podróży
              </h2>

              {history.length === 0 ? (
                <p className="text-gray-500 italic">
                  Historia jest pusta. Paczka została dopiero zarejestrowana.
                </p>
              ) : (
                <div className="space-y-6">
                  {history.map((record, index) => (
                    <div key={index} className="relative flex items-start">
                      {/* Kółko na osi czasu */}
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500 mt-1.5 mr-4 relative z-10 ring-4 ring-white"></div>

                      {/* Pionowa linia (jeśli to nie ostatni element) */}
                      {index !== history.length - 1 && (
                        <div className="absolute top-4 left-[7px] w-0.5 h-full bg-gray-200 -ml-px"></div>
                      )}

                      {/* Zawartość loga */}
                      <div className="bg-white border border-gray-100 shadow-sm rounded p-4 flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-black text-gray-800 uppercase tracking-wide">
                            {record.status}
                          </span>
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {formatDate(record.date)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center mt-2">
                          <svg
                            className="w-4 h-4 mr-1 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                          </svg>
                          {record.branchInfo}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
