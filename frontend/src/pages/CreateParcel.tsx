import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export const CreateParcel: React.FC = () => {
  const navigate = useNavigate();
  
  // Zastępujemy stan "parcel" stanem formularza, 
  // aby przechować rozbity adres przed wysłaniem.
  const [form, setForm] = useState({
    receiverName: "",
    receiverEmail: "",
    receiverStreet: "",
    receiverCity: "",
    receiverPostalCode: "",
    size: "SMALL",
    weight: 1.0,
    isPriority: false,
    isInsured: false,
  });
  
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Złożenie adresu w jeden string
    const combinedAddress = `${form.receiverStreet.trim()}, ${form.receiverCity.trim()}, ${form.receiverPostalCode.trim()}`;
    
    // Budowanie obiektu zgodnego z typem oczekiwanym przez backend (Parcel)
    const payload = {
      receiverName: form.receiverName,
      receiverEmail: form.receiverEmail,
      receiverAddress: combinedAddress,
      size: form.size,
      weight: form.weight,
      isPriority: form.isPriority,
      isInsured: form.isInsured,
    };

    try {
      const response = await api.post("/parcels", payload);
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
            value={form.receiverName}
            onChange={(e) =>
              setForm({ ...form, receiverName: e.target.value })
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
            value={form.receiverEmail}
            onChange={(e) =>
              setForm({ ...form, receiverEmail: e.target.value })
            }
          />
        </div>

        {/* Rozdzielona sekcja adresu */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ulica i numer budynku/lokalu
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md"
            value={form.receiverStreet}
            onChange={(e) =>
              setForm({ ...form, receiverStreet: e.target.value })
            }
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Miasto
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={form.receiverCity}
              onChange={(e) =>
                setForm({ ...form, receiverCity: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kod pocztowy
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={form.receiverPostalCode}
              onChange={(e) =>
                setForm({ ...form, receiverPostalCode: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gabaryt
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={form.size}
              onChange={(e) =>
                setForm({
                  ...form,
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
              value={form.weight}
              onChange={(e) =>
                setForm({ ...form, weight: parseFloat(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="flex items-center space-x-6 py-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded"
              checked={form.isPriority}
              onChange={(e) =>
                setForm({ ...form, isPriority: e.target.checked })
              }
            />
            <span className="ml-2 text-sm text-gray-700">Priorytet</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded"
              checked={form.isInsured}
              onChange={(e) =>
                setForm({ ...form, isInsured: e.target.checked })
              }
            />
            <span className="ml-2 text-sm text-gray-700">Ubezpieczenie</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 mt-2 text-white font-bold bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
        >
          Wylicz cenę i Nadaj Paczkę
        </button>
      </form>
    </div>
  );
};