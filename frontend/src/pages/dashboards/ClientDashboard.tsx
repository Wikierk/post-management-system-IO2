import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";
import { Link } from "react-router-dom";

export const ClientDashboard: React.FC = () => {
  const [myParcels, setMyParcels] = useState<Parcel[]>([]);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const res = await api.get("/parcels/my");
        setMyParcels(res.data);
      } catch (error) {
        console.error("Błąd", error);
      }
    };
    fetchParcels();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-800">
          Panel Klienta: Twoje Paczki
        </h2>
        <Link
          to="/create-parcel"
          className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
        >
          Nadaj Nową Paczkę
        </Link>
      </div>

      {myParcels.length === 0 ? (
        <p>Brak historii paczek.</p>
      ) : (
        <ul className="space-y-3">
          {myParcels.map((p) => (
            <li
              key={p.trackingNumber}
              className="p-4 border rounded flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <div className="font-bold text-lg">{p.trackingNumber}</div>
                <div className="text-sm text-gray-600">
                  Odbiorca: {p.receiverName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Status:</div>
                <div className="font-semibold text-blue-600">{p.status}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
