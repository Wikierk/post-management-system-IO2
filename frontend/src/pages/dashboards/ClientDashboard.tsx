import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";
import { Link } from "react-router-dom";

export const ClientDashboard: React.FC = () => {
  const [myParcels, setMyParcels] = useState<Parcel[]>([]);
  const [complaintReason, setComplaintReason] = useState("");
  const [selectedParcel, setSelectedParcel] = useState("");
  const [complaintMsg, setComplaintMsg] = useState("");

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

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/complaints", {
        trackingNumber: selectedParcel,
        reason: complaintReason,
      });
      setComplaintMsg("Zgłoszenie wysłane!");
      setComplaintReason("");
    } catch {
      setComplaintMsg("Błąd wysyłania zgłoszenia.");
    }
  };

  return (
    <div className="space-y-6">
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

      {/* SEKCJA REKLAMACJI */}
      <div className="bg-white p-6 rounded shadow border-l-4 border-red-500">
        <h3 className="text-lg font-bold text-red-700 mb-4">
          Zgłoś problem z paczką (Reklamacja)
        </h3>
        <form onSubmit={handleComplaintSubmit} className="space-y-4">
          <select
            required
            className="w-full px-3 py-2 border rounded"
            value={selectedParcel}
            onChange={(e) => setSelectedParcel(e.target.value)}
          >
            <option value="" disabled>
              Wybierz paczkę...
            </option>
            {myParcels.map((p) => (
              <option key={p.trackingNumber} value={p.trackingNumber}>
                {p.trackingNumber}
              </option>
            ))}
          </select>
          <textarea
            required
            placeholder="Opisz problem (uszkodzenie, opóźnienie)..."
            className="w-full px-3 py-2 border rounded"
            value={complaintReason}
            onChange={(e) => setComplaintReason(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Wyślij zgłoszenie
          </button>
          {complaintMsg && (
            <span className="ml-4 font-bold">{complaintMsg}</span>
          )}
        </form>
      </div>
    </div>
  );
};
