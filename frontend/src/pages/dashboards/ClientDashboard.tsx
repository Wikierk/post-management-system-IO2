import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { ParcelDetailsModal } from "../../components/ParcelDetailsModal";
import { Tabs } from "../../components/Tabs";
import { ActiveParcelsSection } from "../../components/ActiveParcelsSection";
import { ArchiveParcelsSection } from "../../components/ArchiveParcelsSection";
import { ClientComplaintsSection } from "../../components/ClientComplaintsSection";
import { ProfileSection } from "../../components/ProfileSection";

export const ClientDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "ACTIVE" | "ARCHIVE" | "COMPLAINTS" | "PROFILE"
  >("ACTIVE");
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcelForDetails, setSelectedParcelForDetails] = useState<
    string | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async () => {
    try {
      const resParcels = await api.get("/parcels/my");
      setParcels(resParcels.data);
    } catch {
      addToast("Błąd pobierania danych", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDataChanged = () => {
    setRefreshKey((prev) => prev + 1);
    fetchData();
  };

  const handleClientPayment = async (trackingNumber: string) => {
    try {
      await api.put(`/parcels/${trackingNumber}/pay/client`);
      addToast("Płatność przebiegła pomyślnie!", "success");
      fetchData();
    } catch {
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
      addToast("Błąd pobierania pliku PDF", "error");
    }
  };

  const activeParcels = parcels.filter(
    (p) => !["DELIVERED", "RETURNED"].includes(p.status || ""),
  );
  const archivedParcels = parcels.filter((p) =>
    ["DELIVERED", "RETURNED"].includes(p.status || ""),
  );

  return (
    <div className="bg-white rounded shadow min-h-[600px] border-t-4 border-blue-600">
      {selectedParcelForDetails && (
        <ParcelDetailsModal
          trackingNumber={selectedParcelForDetails}
          onClose={() => setSelectedParcelForDetails(null)}
        />
      )}

      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-2xl font-bold text-blue-800">Panel Klienta</h2>
        <Link
          to="/create-parcel"
          className="px-6 py-2 text-white bg-green-600 rounded font-bold shadow hover:bg-green-700"
        >
          Nadaj Nową Paczkę
        </Link>
      </div>

      <Tabs
        items={[
          {
            key: "ACTIVE",
            label: "Aktywne Przesyłki",
            count: activeParcels.length,
          },
          { key: "ARCHIVE", label: "Archiwum", count: archivedParcels.length },
          { key: "COMPLAINTS", label: "Reklamacje" },
          { key: "PROFILE", label: "Mój Profil" },
        ]}
        activeTab={activeTab}
        onChange={(key) => {
          setActiveTab(key as any);
        }}
      />

      <div className="p-6">
        {activeTab === "ACTIVE" && (
          <ActiveParcelsSection
            key={`active-${refreshKey}`}
            parcels={parcels}
            onParcelSelect={(tn) => setSelectedParcelForDetails(tn)}
            onPay={handleClientPayment}
            onDownloadPdf={handleDownloadPdf}
          />
        )}

        {activeTab === "ARCHIVE" && (
          <ArchiveParcelsSection
            key={`archive-${refreshKey}`}
            parcels={parcels}
            onParcelSelect={(tn) => setSelectedParcelForDetails(tn)}
          />
        )}

        {activeTab === "COMPLAINTS" && (
          <ClientComplaintsSection
            key={`complaints-${refreshKey}`}
            parcels={parcels}
            onDataChanged={handleDataChanged}
          />
        )}

        {activeTab === "PROFILE" && (
          <ProfileSection
            key={`profile-${refreshKey}`}
            onDataChanged={handleDataChanged}
          />
        )}
      </div>
    </div>
  );
};
