import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

interface Pricing {
  id: number;
  size: string;
  basePrice: number;
  weightMultiplier: number;
  priorityAddon: number;
  insuranceAddon: number;
}

interface PricingSectionProps {
  onDataChanged: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onDataChanged,
}) => {
  const { addToast } = useToast();
  const [pricings, setPricings] = useState<Pricing[]>([]);

  const fetchPricings = async () => {
    try {
      const response = await api.get<Pricing[]>("/pricings");
      setPricings(response.data);
    } catch {
      addToast("Błąd ładowania cennika", "error");
    }
  };

  useEffect(() => {
    fetchPricings();
  }, []);

  const updatePricing = async (p: Pricing) => {
    try {
      await api.put(`/pricings/${p.id}`, p);
      addToast("Cennik zapisany!", "success");
      fetchPricings();
      onDataChanged();
    } catch {
      addToast("Błąd zapisu", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Cennik Przesyłek
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {pricings.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            {/* Kafelek z rozmiarem */}
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center border border-purple-200 shadow-inner">
              <span className="text-2xl font-black text-purple-700">{p.size}</span>
            </div>

            {/* Formularze w równej siatce */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* Cena Bazowa */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Cena Bazowa
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={p.basePrice}
                    onChange={(e) =>
                      setPricings(
                        pricings.map((pr) =>
                          pr.id === p.id
                            ? { ...pr, basePrice: parseFloat(e.target.value) || 0 }
                            : pr,
                        ),
                      )
                    }
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-3 pr-8 py-2 transition-colors outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                    zł
                  </span>
                </div>
              </div>

              {/* Cena za Kg */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  + za Kg
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={p.weightMultiplier}
                    onChange={(e) =>
                      setPricings(
                        pricings.map((pr) =>
                          pr.id === p.id
                            ? { ...pr, weightMultiplier: parseFloat(e.target.value) || 0 }
                            : pr,
                        ),
                      )
                    }
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-3 pr-8 py-2 transition-colors outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                    zł
                  </span>
                </div>
              </div>

              {/* Dodatek Priorytet */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  + Priorytet
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={p.priorityAddon}
                    onChange={(e) =>
                      setPricings(
                        pricings.map((pr) =>
                          pr.id === p.id
                            ? { ...pr, priorityAddon: parseFloat(e.target.value) || 0 }
                            : pr,
                        ),
                      )
                    }
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-3 pr-8 py-2 transition-colors outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                    zł
                  </span>
                </div>
              </div>

              {/* Dodatek Ubezpieczenie */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  + Ubezpieczenie
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={p.insuranceAddon}
                    onChange={(e) =>
                      setPricings(
                        pricings.map((pr) =>
                          pr.id === p.id
                            ? { ...pr, insuranceAddon: parseFloat(e.target.value) || 0 }
                            : pr,
                        ),
                      )
                    }
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block pl-3 pr-8 py-2 transition-colors outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                    zł
                  </span>
                </div>
              </div>
            </div>

            {/* Przycisk akcji */}
            <div className="w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0 border-gray-100 flex justify-end">
              <button
                onClick={() => updatePricing(p)}
                className="w-full md:w-auto px-6 py-2.5 bg-purple-600 text-white rounded-lg font-bold shadow-sm hover:bg-purple-700 hover:shadow active:scale-95 transition-all"
              >
                Zapisz
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};