import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

export const ClientDashboard: React.FC = () => {
  const [myParcels, setMyParcels] = useState<Parcel[]>([]);
  const [complaintReason, setComplaintReason] = useState("");
  const [selectedParcel, setSelectedParcel] = useState("");
  const [complaintMsg, setComplaintMsg] = useState("");
  const { addToast } = useToast();

  const fetchParcels = async () => {
    try {
      const res = await api.get("/parcels/my");
      setMyParcels(res.data);
    } catch (error) {
      console.error("Błąd", error);
    }
  };

  useEffect(() => {
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
      fetchParcels(); // Odśwież żeby zmienić status na IN_COMPLAINT
    } catch {
      setComplaintMsg("Błąd wysyłania zgłoszenia.");
    }
  };

  // --- NOWE FUNKCJE: Płatność i PDF ---
  const handleClientPayment = async (trackingNumber: string) => {
    try {
      // Symulacja przekierowania do PayU/Przelewy24
      alert("Przekierowywanie do bezpiecznej bramki płatności... (Symulacja)");
      await api.put(`/parcels/${trackingNumber}/pay/client`);
      addToast("Płatność zakończona pomyślnie!", "success");
      fetchParcels();
    } catch (err) {
      addToast("Wystąpił błąd podczas płatności.", "error");
    }
  };

  const handleDownloadPdf = async (trackingNumber: string) => {
    try {
      const response = await api.get(`/parcels/${trackingNumber}/label`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `etykieta_${trackingNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      addToast("Błąd pobierania PDF", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-800">
            Panel Klienta: Twoje Paczki
          </h2>
          <Link
            to="/create-parcel"
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 font-bold shadow"
          >
            Nadaj Nową Paczkę
          </Link>
        </div>

        {myParcels.length === 0 ? (
          <p className="text-gray-500">
            Brak historii paczek. Nadaj swoją pierwszą przesyłkę!
          </p>
        ) : (
          <ul className="space-y-4">
            {myParcels.map((p) => (
              <li
                key={p.trackingNumber}
                className="p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 transition"
              >
                <div className="mb-4 md:mb-0">
                  <div className="font-black text-xl text-gray-800">
                    {p.trackingNumber}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Odbiorca:{" "}
                    <span className="font-semibold">{p.receiverName}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Koszt przesyłki:{" "}
                    <span className="font-semibold">{p.price} PLN</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-sm font-bold text-gray-700 bg-gray-200 px-3 py-1 rounded-full uppercase">
                    Status:{" "}
                    <span
                      className={
                        p.status === "CREATED"
                          ? "text-red-600"
                          : "text-blue-600"
                      }
                    >
                      {p.status}
                    </span>
                  </div>

                  {/* LOGIKA PRZYCISKÓW */}
                  {p.status === "CREATED" ? (
                    <button
                      onClick={() => handleClientPayment(p.trackingNumber!)}
                      className="w-full md:w-auto px-4 py-2 bg-yellow-500 text-white rounded font-bold hover:bg-yellow-600 shadow"
                    >
                      Opłać Teraz
                    </button>
                  ) : p.status === "IN_COMPLAINT" ? (
                    <span className="text-xs font-bold text-red-500">
                      Zablokowana (Reklamacja)
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDownloadPdf(p.trackingNumber!)}
                      className="w-full md:w-auto px-4 py-2 bg-gray-800 text-white rounded font-bold hover:bg-gray-900 shadow text-xs"
                    >
                      Pobierz Etykietę PDF
                    </button>
                  )}
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
        <form onSubmit={handleComplaintSubmit} className="space-y-4 max-w-xl">
          <select
            required
            className="w-full px-3 py-2 border rounded"
            value={selectedParcel}
            onChange={(e) => setSelectedParcel(e.target.value)}
          >
            <option value="" disabled>
              Wybierz paczkę...
            </option>
            {myParcels
              .filter((p) => p.status !== "IN_COMPLAINT")
              .map((p) => (
                <option key={p.trackingNumber} value={p.trackingNumber}>
                  {p.trackingNumber}
                </option>
              ))}
          </select>
          <textarea
            required
            placeholder="Opisz dokładnie problem..."
            className="w-full px-3 py-2 border rounded h-24"
            value={complaintReason}
            onChange={(e) => setComplaintReason(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white font-bold rounded shadow hover:bg-red-700"
          >
            Wyślij Zgłoszenie
          </button>
          {complaintMsg && (
            <span className="ml-4 font-bold text-red-600">{complaintMsg}</span>
          )}
        </form>
      </div>
    </div>
  );
};
