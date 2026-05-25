import React, { useEffect, useState } from "react";
import api from "../../api/axios";

interface Branch {
  id?: number;
  name: string;
  address: string;
  type: string;
}
interface Complaint {
  id: number;
  parcel: { trackingNumber: string };
  reason: string;
  status: string;
}
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
interface Pricing {
  id: number;
  size: string;
  basePrice: number;
  weightMultiplier: number;
  priorityAddon: number;
  insuranceAddon: number;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "USERS" | "BRANCHES" | "PRICING" | "COMPLAINTS" | "FINANCE"
  >("FINANCE");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [newBranch, setNewBranch] = useState<Branch>({
    name: "",
    address: "",
    type: "POST_OFFICE",
  });
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pricings, setPricings] = useState<Pricing[]>([]);

  const [revenue, setRevenue] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    const [resBranches, resComplaints, resUsers, resPricings] =
      await Promise.all([
        api.get("/branches"),
        api.get("/complaints/all"),
        api.get("/users"),
        api.get("/pricings"),
      ]);
    setBranches(resBranches.data);
    setComplaints(resComplaints.data);
    setUsers(resUsers.data);
    setPricings(resPricings.data);
    fetchRevenue("", "");
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchRevenue = async (start: string, end: string) => {
    const params = new URLSearchParams();
    if (start) params.append("startDate", start);
    if (end) params.append("endDate", end);
    const res = await api.get(`/parcels/finance-report?${params.toString()}`);
    setRevenue(res.data);
  };

  const handleBranchSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/branches", newBranch);
    setNewBranch({ name: "", address: "", type: "POST_OFFICE" });
    fetchData();
  };

  const changeUserRole = async (id: number, newRole: string) => {
    await api.put(`/users/${id}/role?newRole=${newRole}`);
    fetchData();
  };

  const updatePricing = async (p: Pricing) => {
    await api.put(`/pricings/${p.id}`, p);
    alert("Cennik zaktualizowany!");
    fetchData();
  };

  const resolveComplaint = async (id: number, status: string) => {
    await api.put(`/complaints/${id}/resolve?status=${status}`);
    fetchData();
  };

  return (
    <div className="bg-white rounded shadow min-h-[600px]">
      {/* NAWIGACJA ZAKŁADEK */}
      <div className="flex border-b">
        {[
          { key: "FINANCE", label: "Raporty Finansowe" },
          { key: "USERS", label: "Użytkownicy" },
          { key: "BRANCHES", label: "Placówki" },
          { key: "PRICING", label: "Cennik" },
          { key: "COMPLAINTS", label: "Reklamacje" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-4 font-bold text-sm ${activeTab === tab.key ? "border-b-4 border-blue-600 text-blue-800" : "text-gray-500 hover:text-gray-800"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ZAKŁADKA FINANSE */}
        {activeTab === "FINANCE" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-green-800">
              Przychody Systemu
            </h2>
            <div className="flex space-x-4 items-end bg-gray-50 p-4 rounded border">
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
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Filtruj
              </button>
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  fetchRevenue("", "");
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Wyczyść
              </button>
            </div>
            <div className="text-4xl font-black text-green-600 mt-4">
              {revenue.toFixed(2)} PLN
            </div>
          </div>
        )}

        {/* ZAKŁADKA UŻYTKOWNICY */}
        {activeTab === "USERS" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-blue-800">
              Baza Użytkowników
            </h2>
            <table className="min-w-full text-left bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Imię i Nazwisko</th>
                  <th className="p-3 border-b">Rola</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{u.id}</td>
                    <td className="p-3 border-b">{u.email}</td>
                    <td className="p-3 border-b">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-3 border-b">
                      <select
                        value={u.role}
                        onChange={(e) => changeUserRole(u.id, e.target.value)}
                        className="border px-2 py-1 rounded bg-white"
                      >
                        <option value="CLIENT">Klient</option>
                        <option value="COURIER">Kurier</option>
                        <option value="SORTING_WORKER">Prac. Sortowni</option>
                        <option value="CUSTOMER_SERVICE">
                          Okienko (Obsługa)
                        </option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ZAKŁADKA PLACÓWKI */}
        {activeTab === "BRANCHES" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-red-800">
              Placówki i Sortownie
            </h2>
            <form
              onSubmit={handleBranchSave}
              className="flex space-x-2 p-4 bg-gray-50 rounded border"
            >
              <input
                type="text"
                placeholder="Nazwa"
                required
                className="px-3 py-2 border rounded flex-1"
                value={newBranch.name}
                onChange={(e) =>
                  setNewBranch({ ...newBranch, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Adres"
                required
                className="px-3 py-2 border rounded flex-1"
                value={newBranch.address}
                onChange={(e) =>
                  setNewBranch({ ...newBranch, address: e.target.value })
                }
              />
              <select
                className="px-3 py-2 border rounded"
                value={newBranch.type}
                onChange={(e) =>
                  setNewBranch({ ...newBranch, type: e.target.value })
                }
              >
                <option value="POST_OFFICE">Urząd Pocztowy</option>
                <option value="SORTING_CENTER">Sortownia</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Dodaj Nową
              </button>
            </form>
            <ul className="space-y-2">
              {branches.map((b) => (
                <li
                  key={b.id}
                  className="p-3 border rounded flex justify-between items-center bg-white shadow-sm"
                >
                  <div>
                    <span className="font-bold">{b.name}</span> - {b.address}{" "}
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-2">
                      {b.type}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      api.delete(`/branches/${b.id}`).then(fetchData)
                    }
                    className="text-red-600 font-bold hover:underline"
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ZAKŁADKA CENNIK */}
        {activeTab === "PRICING" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-purple-800">
              Zarządzanie Cennikiem (Dynamiczny Wzorzec Strategii)
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {pricings.map((p) => (
                <div
                  key={p.id}
                  className="p-4 border rounded shadow-sm bg-purple-50 flex items-center justify-between"
                >
                  <div className="font-black text-xl w-32">{p.size}</div>
                  <div className="flex space-x-4">
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
                        className="w-20 border px-2 py-1"
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
                                    weightMultiplier: parseFloat(
                                      e.target.value,
                                    ),
                                  }
                                : pr,
                            ),
                          )
                        }
                        className="w-20 border px-2 py-1"
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
                        className="w-20 border px-2 py-1"
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
                        className="w-20 border px-2 py-1"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => updatePricing(p)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Zapisz
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZAKŁADKA REKLAMACJE */}
        {activeTab === "COMPLAINTS" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-orange-800">
              Oczekujące Zgłoszenia (Rozpatrywanie)
            </h2>
            <ul className="space-y-3">
              {complaints
                .filter((c) => c.status === "PENDING")
                .map((c) => (
                  <li
                    key={c.id}
                    className="p-4 border border-orange-300 rounded flex justify-between items-center bg-orange-50"
                  >
                    <div>
                      <div className="font-bold">
                        Paczka: {c.parcel.trackingNumber}
                      </div>
                      <div className="text-sm italic">"{c.reason}"</div>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => resolveComplaint(c.id, "ACCEPTED")}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                      >
                        Uznaj
                      </button>
                      <button
                        onClick={() => resolveComplaint(c.id, "REJECTED")}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Odrzuć
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
