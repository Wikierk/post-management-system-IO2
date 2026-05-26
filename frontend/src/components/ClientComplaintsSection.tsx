import React, { useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Pagination } from "./Pagination";
import type { Parcel } from "../types/parcel";

interface Complaint {
  id: number;
  parcel: { trackingNumber: string };
  reason: string;
  status: string;
  adminResponse?: string;
}

interface ClientComplaintsSectionProps {
  parcels: Parcel[];
  onDataChanged: () => void;
}

export const ClientComplaintsSection: React.FC<
  ClientComplaintsSectionProps
> = ({ parcels, onDataChanged }) => {
  const { addToast } = useToast();
  const [selectedParcel, setSelectedParcel] = useState("");
  const [complaintReason, setComplaintReason] = useState("");
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  React.useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get("/complaints/my");
      setMyComplaints(response.data);
    } catch {
      addToast("Błąd pobierania reklamacji", "error");
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/complaints", {
        trackingNumber: selectedParcel,
        reason: complaintReason,
      });
      addToast("Zgłoszenie wysłane pomyślnie!", "success");
      setComplaintReason("");
      setSelectedParcel("");
      setCurrentPage(1);
      fetchComplaints();
      onDataChanged();
    } catch {
      addToast("Błąd wysyłania zgłoszenia.", "error");
    }
  };

  const activeParcels = parcels.filter(
    (p) => !["DELIVERED", "RETURNED"].includes(p.status || ""),
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const complaintsPaginatedList = myComplaints.slice(startIdx, endIdx);
  const totalPages = Math.ceil(myComplaints.length / ITEMS_PER_PAGE);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-red-50 p-6 rounded border border-red-200 h-fit">
        <h3 className="text-lg font-bold text-red-700 mb-4">
          Zgłoś problem z paczką
        </h3>
        <form onSubmit={handleComplaintSubmit} className="space-y-4">
          <select
            required
            className="w-full px-3 py-2 border rounded bg-white"
            value={selectedParcel}
            onChange={(e) => setSelectedParcel(e.target.value)}
          >
            <option value="" disabled>
              Wybierz paczkę do reklamacji...
            </option>
            {activeParcels
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
            className="w-full px-3 py-2 border rounded h-32 bg-white"
            value={complaintReason}
            onChange={(e) => setComplaintReason(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="w-full py-3 bg-red-600 text-white font-bold rounded shadow hover:bg-red-700 transition"
          >
            Wyślij Zgłoszenie
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Twoje zgłoszenia
        </h3>
        {complaintsPaginatedList.length === 0 ? (
          <p className="text-gray-500 italic">
            Nie masz jeszcze żadnych zgłoszeń reklamacyjnych.
          </p>
        ) : (
          <>
            <ul className="space-y-4">
              {complaintsPaginatedList.map((c) => (
                <li
                  key={c.id}
                  className="p-4 border rounded-lg bg-white shadow-sm flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2 border-b pb-2">
                    <div>
                      <span className="font-bold text-gray-800">
                        Paczka: {c.parcel.trackingNumber}
                      </span>
                      {c.status === "PENDING" && (
                        <span className="ml-3 text-xs font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded uppercase">
                          Oczekuje na rozpatrzenie
                        </span>
                      )}
                      {c.status === "ACCEPTED" && (
                        <span className="ml-3 text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded uppercase">
                          Uznana
                        </span>
                      )}
                      {c.status === "REJECTED" && (
                        <span className="ml-3 text-xs font-bold bg-red-100 text-red-800 px-2 py-1 rounded uppercase">
                          Odrzucona
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-semibold">Zgłoszenie:</span>{" "}
                    {c.reason}
                  </div>

                  {c.status !== "PENDING" && (
                    <div className="mt-2 p-3 bg-gray-50 border-l-4 border-gray-400 rounded text-sm">
                      <span className="font-bold text-gray-700 block mb-1">
                        Decyzja Administracji:
                      </span>
                      <span className="text-gray-800 italic">
                        {c.adminResponse || "Brak dodatkowego uzasadnienia."}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={myComplaints.length}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
