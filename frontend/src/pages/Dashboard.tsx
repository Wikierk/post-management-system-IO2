import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import type { Parcel } from "../types/parcel";

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [myParcels, setMyParcels] = useState<Parcel[]>([]);
  const [allParcels, setAllParcels] = useState<Parcel[]>([]); // Do symulacji Kuriera

  const fetchParcels = async () => {
    try {
      const resMy = await api.get("/parcels/my");
      setMyParcels(resMy.data);

      const resAll = await api.get("/parcels/all");
      setAllParcels(resAll.data);
    } catch (error) {
      console.error("Błąd ładowania paczek", error);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleAdvanceStatus = async (trackingNumber: string) => {
    try {
      await api.put(`/parcels/${trackingNumber}/next-state`);
      fetchParcels(); // Odśwież listę po zmianie statusu
    } catch (error) {
      alert("Nie można zmienić statusu. Być może to już status końcowy.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold">System Poczty - Panel</h1>
        <div className="space-x-4">
          <Link
            to="/tracking"
            className="px-4 py-2 text-blue-600 hover:underline"
          >
            Śledzenie
          </Link>
          <Link
            to="/create-parcel"
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
          >
            Nadaj paczkę
          </Link>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
          >
            Wyloguj
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SEKCJA KLIENTA */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-blue-800">
            Twoje nadane paczki (Klient)
          </h2>
          {myParcels.length === 0 ? (
            <p>Brak nadanych paczek.</p>
          ) : (
            <ul className="space-y-3">
              {myParcels.map((p) => (
                <li key={p.trackingNumber} className="p-3 border rounded">
                  <div className="font-bold">{p.trackingNumber}</div>
                  <div className="text-sm text-gray-600">
                    Do: {p.receiverName} | Status:{" "}
                    <span className="font-semibold text-blue-600">
                      {p.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SEKCJA KURIERA / SORTOWNI */}
        <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
          <h2 className="text-xl font-bold mb-4 text-yellow-700">
            Symulacja Pracy (Kurier / Sortownia)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Tutaj pracownik może awansować status paczki (Wzorzec State w tle).
          </p>
          <ul className="space-y-3">
            {allParcels.map((p) => (
              <li
                key={p.trackingNumber}
                className="p-3 border rounded flex justify-between items-center bg-gray-50"
              >
                <div>
                  <div className="font-bold">{p.trackingNumber}</div>
                  <div className="text-xs">
                    Aktualny: <span className="font-bold">{p.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAdvanceStatus(p.trackingNumber!)}
                  className="px-3 py-1 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700"
                >
                  Zmień Status (Next State)
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
