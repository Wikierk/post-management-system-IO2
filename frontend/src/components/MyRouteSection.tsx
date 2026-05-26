import React, { useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Parcel } from "../types/parcel";

interface MyRouteSectionProps {
  parcels: Parcel[];
  onParcelSelect: (trackingNumber: string) => void;
  onDataChanged: () => void;
}

export const MyRouteSection: React.FC<MyRouteSectionProps> = ({
  parcels,
  onParcelSelect,
  onDataChanged,
}) => {
  const { addToast } = useToast();
  const [selectedParcels, setSelectedParcels] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: "", onConfirm: () => {} });

  const myRouteParcels = parcels.filter(
    (p) => !["DELIVERED", "RETURNED"].includes(p.status || ""),
  );

  const toggleParcelSelection = (trackingNumber: string) => {
    setSelectedParcels((prev) =>
      prev.includes(trackingNumber)
        ? prev.filter((t) => t !== trackingNumber)
        : [...prev, trackingNumber],
    );
  };

  const toggleAll = () => {
    if (selectedParcels.length === myRouteParcels.length)
      setSelectedParcels([]);
    else setSelectedParcels(myRouteParcels.map((p) => p.trackingNumber!));
  };

  const setExplicitStatus = async (trackingNumber: string, status: string) => {
    try {
      await api.put(
        `/parcels/${trackingNumber}/override-status?status=${status}`,
      );
      addToast(`Zaktualizowano paczkę na: ${status}`, "success");
      onDataChanged();
    } catch {
      addToast("Błąd zmiany statusu", "error");
    }
  };

  const executeBulkDeliver = async () => {
    try {
      await Promise.all(
        selectedParcels.map((tracking) =>
          api.put(`/parcels/${tracking}/override-status?status=DELIVERED`),
        ),
      );
      addToast(
        `Pomyślnie doręczono ${selectedParcels.length} paczek!`,
        "success",
      );
      setSelectedParcels([]);
      onDataChanged();
    } catch {
      addToast("Część paczek mogła nie zostać zaktualizowana.", "error");
      onDataChanged();
    }
  };

  const handleBulkDeliver = async () => {
    if (selectedParcels.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      message: `Czy na pewno oznaczyć ${selectedParcels.length} paczek jako DORĘCZONE?`,
      onConfirm: executeBulkDeliver,
    });
  };

  return (
    <div className="bg-white p-6 rounded shadow border-t-4 border-yellow-500">
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Potwierdź doręczenie"
        message={confirmDialog.message}
        confirmText="Doręcz"
        cancelText="Anuluj"
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-yellow-800">
          Moja Trasa (Wydane do doręczenia)
        </h2>
        {selectedParcels.length > 0 && (
          <button
            onClick={handleBulkDeliver}
            className="px-6 py-2 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 animate-pulse"
          >
            Doręcz Zaznaczone ({selectedParcels.length})
          </button>
        )}
      </div>

      {myRouteParcels.length === 0 ? (
        <p className="text-gray-500">Brak aktywnych paczek na trasie.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b text-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5 cursor-pointer"
                    onChange={toggleAll}
                    checked={
                      selectedParcels.length === myRouteParcels.length &&
                      myRouteParcels.length > 0
                    }
                  />
                </th>
                <th className="p-3 border-b">Paczka</th>
                <th className="p-3 border-b">Adres Dostawy</th>
                <th className="p-3 border-b text-right">Akcja Jawna</th>
              </tr>
            </thead>
            <tbody>
              {myRouteParcels.map((p) => (
                <tr
                  key={p.trackingNumber}
                  className="hover:bg-yellow-50 border-b"
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="w-5 h-5 cursor-pointer"
                      checked={selectedParcels.includes(p.trackingNumber!)}
                      onChange={() => toggleParcelSelection(p.trackingNumber!)}
                    />
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => onParcelSelect(p.trackingNumber!)}
                      className="font-black text-blue-700 hover:underline"
                    >
                      {p.trackingNumber}
                    </button>
                    <div className="text-xs text-gray-500 font-bold uppercase">
                      {p.status}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-gray-800">
                      {p.receiverName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {p.receiverAddress}
                    </div>
                  </td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() =>
                        setExplicitStatus(p.trackingNumber!, "DELIVERED")
                      }
                      className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded shadow hover:bg-green-700"
                    >
                      DORĘCZ
                    </button>
                    <button
                      onClick={() =>
                        setExplicitStatus(p.trackingNumber!, "RETURNED")
                      }
                      className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded shadow hover:bg-red-700"
                    >
                      ZWROT / AWIZO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
