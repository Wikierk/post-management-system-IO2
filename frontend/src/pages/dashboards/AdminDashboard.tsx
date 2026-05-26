import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { Tabs } from "../../components/Tabs";
import { UsersSection } from "../../components/UsersSection";
import { BranchesSection } from "../../components/BranchesSection";
import { PricingSection } from "../../components/PricingSection";
import { ComplaintsSection } from "../../components/ComplaintsSection";

interface Branch {
  id?: number;
  name: string;
  address: string;
  type: string;
}

export const AdminDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "FINANCE" | "USERS" | "BRANCHES" | "PRICING" | "COMPLAINTS"
  >("FINANCE");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [revenue, setRevenue] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async () => {
    try {
      const resBranches = await api.get("/branches");
      setBranches(resBranches.data);
      fetchRevenue("", "");
    } catch {
      addToast("Błąd ładowania danych z serwera", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchRevenue = async (start: string, end: string) => {
    const params = new URLSearchParams();
    if (start) params.append("startDate", start);
    if (end) params.append("endDate", end);
    try {
      const res = await api.get(`/parcels/finance-report?${params.toString()}`);
      setRevenue(res.data);
    } catch {
      addToast("Błąd raportu", "error");
    }
  };

  const handleDataChanged = () => {
    setRefreshKey((prev) => prev + 1);
    fetchData();
  };

  return (
    <div className="bg-white rounded shadow min-h-[600px]">
      <Tabs
        items={[
          { key: "FINANCE", label: "Finanse" },
          { key: "USERS", label: "Użytkownicy" },
          { key: "BRANCHES", label: "Placówki" },
          { key: "PRICING", label: "Cennik" },
          { key: "COMPLAINTS", label: "Reklamacje" },
        ]}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as any)}
      />

      <div className="p-6">
        {activeTab === "FINANCE" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-green-800">
              Przychody Systemu
            </h2>
            <div className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded border">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Od daty
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Do daty
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
              </div>
              <button
                onClick={() => fetchRevenue(startDate, endDate)}
                className="px-4 py-2 bg-blue-600 text-white rounded font-bold"
              >
                Filtruj
              </button>
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  fetchRevenue("", "");
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded font-bold"
              >
                Wyczyść
              </button>
            </div>
            <div className="text-5xl font-black text-green-600 mt-4">
              {revenue.toFixed(2)} PLN
            </div>
          </div>
        )}

        {activeTab === "USERS" && (
          <UsersSection
            key={`users-${refreshKey}`}
            branches={branches}
            onDataChanged={handleDataChanged}
          />
        )}

        {activeTab === "BRANCHES" && (
          <BranchesSection
            key={`branches-${refreshKey}`}
            onDataChanged={handleDataChanged}
          />
        )}

        {activeTab === "PRICING" && (
          <PricingSection
            key={`pricing-${refreshKey}`}
            onDataChanged={handleDataChanged}
          />
        )}

        {activeTab === "COMPLAINTS" && (
          <ComplaintsSection
            key={`complaints-${refreshKey}`}
            onDataChanged={handleDataChanged}
          />
        )}
      </div>
    </div>
  );
};
