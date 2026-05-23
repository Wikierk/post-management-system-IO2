import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import type { Parcel } from "../types/parcel";

export const CreateParcel: React.FC = () => {
  const navigate = useNavigate();
  const [parcel, setParcel] = useState<Parcel>({
    receiverName: "",
    receiverEmail: "",
    receiverAddress: "",
    size: "SMALL",
    weight: 1.0,
    isPriority: false,
    isInsured: false,
  });
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/parcels", parcel);
      setSuccessMsg(
        `Paczka utworzona! Numer nadania: ${response.data.trackingNumber} | Cena: ${response.data.price} zł`,
      );
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      console.error("Błąd podczas tworzenia paczki", err);
    }
  };

  return (
    <div className="max-w-2xl p-8 mx-auto mt-10 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Nadaj nową paczkę
      </h2>

      {successMsg && (
        <div className="p-4 mb-6 text-green-800 bg-green-100 rounded-lg">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imię i Nazwisko Odbiorcy
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md"
            onChange={(e) =>
              setParcel({ ...parcel, receiverName: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Odbiorcy
          </label>
          <input
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md"
            onChange={(e) =>
              setParcel({ ...parcel, receiverEmail: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Adres Odbiorcy
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md"
            onChange={(e) =>
              setParcel({ ...parcel, receiverAddress: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gabaryt
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              onChange={(e) =>
                setParcel({
                  ...parcel,
                  size: e.target.value as "SMALL" | "MEDIUM" | "LARGE",
                })
              }
            >
              <option value="SMALL">Mała (Koperta/List)</option>
              <option value="MEDIUM">Średnia (Paczka standard)</option>
              <option value="LARGE">Duża (Gabaryt)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Waga (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={parcel.weight}
              onChange={(e) =>
                setParcel({ ...parcel, weight: parseFloat(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded"
              onChange={(e) =>
                setParcel({ ...parcel, isPriority: e.target.checked })
              }
            />
            <span className="ml-2 text-sm text-gray-700">Priorytet</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded"
              onChange={(e) =>
                setParcel({ ...parcel, isInsured: e.target.checked })
              }
            />
            <span className="ml-2 text-sm text-gray-700">Ubezpieczenie</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Wylicz cenę i Nadaj Paczkę
        </button>
      </form>
    </div>
  );
};
