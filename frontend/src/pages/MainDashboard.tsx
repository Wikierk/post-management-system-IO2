import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ClientDashboard } from "./dashboards/ClientDashboard";
import { CourierDashboard } from "./dashboards/CourierDashboard";
import { SortingDashboard } from "./dashboards/SortingDashboard";
import { CustomerServiceDashboard } from "./dashboards/CustomerServiceDashboard";
import { AdminDashboard } from "./dashboards/AdminDashboard";

export const MainDashboard: React.FC = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderDashboardByRole = () => {
    switch (role) {
      case "CLIENT":
        return <ClientDashboard />;
      case "COURIER":
        return <CourierDashboard />;
      case "SORTING_WORKER":
        return <SortingDashboard />;
      case "CUSTOMER_SERVICE":
        return <CustomerServiceDashboard />;
      case "ADMIN":
        return <AdminDashboard />;
      default:
        return <p>Nieznana rola: {role}</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
          <h1 className="text-2xl font-bold text-gray-800">
            Poczta App - Zalogowano jako{" "}
            <span className="text-blue-600">{role}</span>
          </h1>
          <div className="space-x-4">
            <Link
              to="/tracking"
              className="px-4 py-2 text-blue-600 hover:underline"
            >
              Śledzenie
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900"
            >
              Wyloguj
            </button>
          </div>
        </div>

        {renderDashboardByRole()}
      </div>
    </div>
  );
};
