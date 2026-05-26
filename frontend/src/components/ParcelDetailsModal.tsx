import React, { useEffect, useState } from "react";
import api from "../api/axios";
import type { Parcel } from "../types/parcel";

interface HistoryRecord {
  status: string;
  date: string;
  branchInfo: string;
}

interface Props {
  trackingNumber: string;
  onClose: () => void;
}

export const ParcelDetailsModal: React.FC<Props> = ({
  trackingNumber,
  onClose,
}) => {
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    api
      .get(`/parcels/${trackingNumber}`)
      .then((res) => setParcel(res.data))
      .catch(console.error);
    api
      .get(`/parcels/${trackingNumber}/history`)
      .then((res) => setHistory(res.data))
      .catch(console.error);
  }, [trackingNumber]);

  if (!parcel) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg font-bold">
          Pobieranie danych paczki...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              Szczegóły Przesyłki
            </h2>
            <p className="text-blue-600 font-mono font-bold">
              {parcel.trackingNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600 transition text-3xl font-bold leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-800 font-bold uppercase mb-1">
                Odbiorca
              </p>
              <p className="font-bold text-lg">{parcel.receiverName}</p>
              <p className="text-gray-600">{parcel.receiverAddress}</p>
              <p className="text-gray-500 text-sm mt-1">
                {parcel.receiverEmail}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                Parametry
              </p>
              <p>
                <span className="font-semibold text-gray-700">Gabaryt:</span>{" "}
                {parcel.size} ({parcel.weight} kg)
              </p>
              <p>
                <span className="font-semibold text-gray-700">Opcje:</span>{" "}
                {parcel.isPriority ? "Priorytet" : "Standard"}{" "}
                {parcel.isInsured && ", Ubezpieczona"}
              </p>
              <p>
                <span className="font-semibold text-gray-700">Cena:</span>{" "}
                {parcel.price} PLN
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
              Ostatnie logi w systemie
            </h3>
            {history.length === 0 ? (
              <p className="text-gray-500">Brak logów historycznych.</p>
            ) : (
              <ul className="space-y-3">
                {history.map((h, i) => (
                  <li
                    key={i}
                    className="text-sm bg-white p-3 rounded-lg border flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-gray-50 transition"
                  >
                    <div className="mb-1 sm:mb-0">
                      <span className="font-black text-gray-800 uppercase bg-gray-200 px-2 py-1 rounded text-xs mr-2">
                        {h.status}
                      </span>
                      <span className="text-gray-600 font-medium">
                        {h.branchInfo}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {new Date(h.date).toLocaleString("pl-PL")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
