import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

interface ProfileSectionProps {
  onDataChanged: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  onDataChanged,
}) => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile");
      setProfile({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        password: "",
      });
    } catch {
      addToast("Błąd pobierania profilu", "error");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/profile", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        password: profile.password || undefined,
      });
      addToast("Profil zaktualizowany!", "success");
      setProfile({ ...profile, password: "" });
      onDataChanged();
    } catch {
      addToast("Błąd aktualizacji profilu.", "error");
    }
  };

  return (
    <form
      onSubmit={handleProfileUpdate}
      className="max-w-md space-y-4 bg-gray-50 p-6 rounded border"
    >
      <h3 className="font-bold text-lg mb-4 text-purple-800">
        Moje Dane i Zabezpieczenia
      </h3>
      <div>
        <label className="block text-sm font-bold text-gray-700">
          Email (Login) - Nie można zmienić
        </label>
        <input
          type="email"
          disabled
          value={profile.email}
          className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">
          Zmianę adresu email może wykonać tylko administrator.
        </p>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700">Imię</label>
        <input
          type="text"
          required
          value={profile.firstName}
          onChange={(e) =>
            setProfile({ ...profile, firstName: e.target.value })
          }
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700">
          Nazwisko
        </label>
        <input
          type="text"
          required
          value={profile.lastName}
          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="pt-4 border-t">
        <label className="block text-sm font-bold text-red-700">
          Nowe Hasło (Zostaw puste by nie zmieniać)
        </label>
        <input
          type="password"
          placeholder="Wpisz nowe hasło..."
          value={profile.password}
          onChange={(e) => setProfile({ ...profile, password: e.target.value })}
          className="w-full px-3 py-2 border rounded border-red-300"
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 mt-4 bg-purple-600 text-white font-bold rounded shadow hover:bg-purple-700"
      >
        Zapisz Zmiany
      </button>
    </form>
  );
};
