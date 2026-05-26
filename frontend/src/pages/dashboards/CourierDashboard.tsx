import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Parcel } from "../../types/parcel";
import { useToast } from "../../context/ToastContext";
import { ParcelDetailsModal } from "../../components/ParcelDetailsModal";
import { MyRouteSection } from "../../components/MyRouteSection";
import { UnassignedParcelsSection } from "../../components/UnassignedParcelsSection";

export const CourierDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [unassignedParcels, setUnassignedParcels] = useState<Parcel[]>([]);
  const [myRouteParcels, setMyRouteParcels] = useState<Parcel[]>([]);
  const [selectedParcelForDetails, setSelectedParcelForDetails] = useState<
    string | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchParcels = async () => {
    try {
      const unassignedRes = await api.get("/parcels/unassigned");
      setUnassignedParcels(unassignedRes.data);
      const myRouteRes = await api.get("/parcels/courier");
      setMyRouteParcels(myRouteRes.data);
    } catch (error) {
      addToast("Błąd ładowania paczek", "error");
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleDataChanged = () => {
    setRefreshKey((prev) => prev + 1);
    fetchParcels();
  };

  return (
    <div className="space-y-8 min-h-[600px]">
      {selectedParcelForDetails && (
        <ParcelDetailsModal
          trackingNumber={selectedParcelForDetails}
          onClose={() => setSelectedParcelForDetails(null)}
        />
      )}

      <MyRouteSection
        key={`myroute-${refreshKey}`}
        parcels={myRouteParcels}
        onParcelSelect={(tn) => setSelectedParcelForDetails(tn)}
        onDataChanged={handleDataChanged}
      />

      <UnassignedParcelsSection
        key={`unassigned-${refreshKey}`}
        parcels={unassignedParcels}
        onDataChanged={handleDataChanged}
      />
    </div>
  );
};
