import React, { useState } from "react";
import { Pagination } from "./Pagination";
import type { Parcel } from "../types/parcel";

interface ArchiveParcelsSectionProps {
  parcels: Parcel[];
  onParcelSelect: (trackingNumber: string) => void;
}

export const ArchiveParcelsSection: React.FC<ArchiveParcelsSectionProps> = ({
  parcels,
  onParcelSelect,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const archivedParcels = parcels.filter((p) =>
    ["DELIVERED", "RETURNED"].includes(p.status || ""),
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedParcels = archivedParcels.slice(startIdx, endIdx);
  const totalPages = Math.ceil(archivedParcels.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4 opacity-80">
      {paginatedParcels.length === 0 ? (
        <p className="text-gray-500">Archiwum jest puste.</p>
      ) : (
        <>
          {paginatedParcels.map((p) => (
            <div
              key={p.trackingNumber}
              className="p-4 border rounded-lg flex justify-between items-center bg-gray-50"
            >
              <div>
                <div className="font-black text-lg text-gray-700">
                  {p.trackingNumber}
                </div>
                <div className="text-sm font-bold text-gray-500">
                  Zakończono: {p.status}
                </div>
              </div>
              <button
                onClick={() => onParcelSelect(p.trackingNumber!)}
                className="px-4 py-2 border border-gray-400 text-gray-600 font-bold rounded hover:bg-gray-200"
              >
                Podgląd
              </button>
            </div>
          ))}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={archivedParcels.length}
            />
          )}
        </>
      )}
    </div>
  );
};
