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
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-purple-800">
        Cennik (Dynamiczny Wzorzec Strategii)
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {pricings.map((p) => (
          <div
            key={p.id}
            className="p-4 border rounded shadow-sm bg-purple-50 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="font-black text-xl w-32">{p.size}</div>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-bold">Cena Bazowa</label>
                <input
                  type="number"
                  step="0.1"
                  value={p.basePrice}
                  onChange={(e) =>
                    setPricings(
                      pricings.map((pr) =>
                        pr.id === p.id
                          ? {
                              ...pr,
                              basePrice: parseFloat(e.target.value),
                            }
                          : pr,
                      ),
                    )
                  }
                  className="w-24 border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="text-xs font-bold">+ za Kg</label>
                <input
                  type="number"
                  step="0.1"
                  value={p.weightMultiplier}
                  onChange={(e) =>
                    setPricings(
                      pricings.map((pr) =>
                        pr.id === p.id
                          ? {
                              ...pr,
                              weightMultiplier: parseFloat(e.target.value),
                            }
                          : pr,
                      ),
                    )
                  }
                  className="w-24 border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="text-xs font-bold">+ Priorytet</label>
                <input
                  type="number"
                  step="0.1"
                  value={p.priorityAddon}
                  onChange={(e) =>
                    setPricings(
                      pricings.map((pr) =>
                        pr.id === p.id
                          ? {
                              ...pr,
                              priorityAddon: parseFloat(e.target.value),
                            }
                          : pr,
                      ),
                    )
                  }
                  className="w-24 border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="text-xs font-bold">+ Ubezp.</label>
                <input
                  type="number"
                  step="0.1"
                  value={p.insuranceAddon}
                  onChange={(e) =>
                    setPricings(
                      pricings.map((pr) =>
                        pr.id === p.id
                          ? {
                              ...pr,
                              insuranceAddon: parseFloat(e.target.value),
                            }
                          : pr,
                      ),
                    )
                  }
                  className="w-24 border px-2 py-1 rounded"
                />
              </div>
            </div>
            <button
              onClick={() => updatePricing(p)}
              className="px-6 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700"
            >
              Zapisz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
