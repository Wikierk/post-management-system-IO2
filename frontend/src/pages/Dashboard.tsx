import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Panel Główny (Zalogowano)</h1>
      <p className="mb-4">Witaj w systemie obsługi poczty tradycyjnej!</p>
      <p className="mb-4 text-gray-500 italic">
        Tutaj w Kamieniu Milowym 2 pojawi się formularz nadawania paczek oraz
        tablica kuriera.
      </p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Wyloguj
      </button>
    </div>
  );
};
