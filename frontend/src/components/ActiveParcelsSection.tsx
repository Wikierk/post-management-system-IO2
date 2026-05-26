import React, { useState } from "react";
import { Pagination } from "./Pagination";
import type { Parcel } from "../types/parcel";

interface ActiveParcelsSectionProps {
  parcels: Parcel[];
  onParcelSelect: (trackingNumber: string) => void;
  onPay: (trackingNumber: string) => void;
  onDownloadPdf: (trackingNumber: string) => void;
}

export const ActiveParcelsSection: React.FC<ActiveParcelsSectionProps> = ({
  parcels,
  onParcelSelect,
  onPay,
  onDownloadPdf,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const activeParcels = parcels.filter(
    (p) => !["DELIVERED", "RETURNED"].includes(p.status || ""),
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedParcels = activeParcels.slice(startIdx, endIdx);
  const totalPages = Math.ceil(activeParcels.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {paginatedParcels.length === 0 ? (
        <p className="text-gray-500">Brak aktywnych paczek.</p>
      ) : (
        <>
          {paginatedParcels.map((p) => (
            <div
              key={p.trackingNumber}
              className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-center bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="mb-4 md:mb-0">
                <div className="font-black text-xl text-gray-800">
                  {p.trackingNumber}
                </div>
                <div className="text-sm text-gray-600">
                  Odbiorca:{" "}
                  <span className="font-semibold">{p.receiverName}</span>
                </div>
                <div className="text-sm font-bold mt-2 uppercase text-blue-600">
                  Status: {p.status}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => onParcelSelect(p.trackingNumber!)}
                  className="px-4 py-2 border-2 border-blue-600 text-blue-600 font-bold rounded hover:bg-blue-50"
                >
                  Szczegóły
                </button>
                {p.status === "CREATED" && (
                  <button
                    onClick={() => onPay(p.trackingNumber!)}
                    className="px-4 py-2 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600 shadow"
                  >
                    Opłać {p.price} PLN
                  </button>
                )}
                {p.status !== "CREATED" && p.status !== "IN_COMPLAINT" && (
                  <button
                    onClick={() => onDownloadPdf(p.trackingNumber!)}
                    className="px-4 py-2 bg-gray-800 text-white font-bold rounded shadow hover:bg-gray-900 transition"
                  >
                    Pobierz PDF
                  </button>
                )}
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={activeParcels.length}
            />
          )}
        </>
      )}
    </div>
  );
};
