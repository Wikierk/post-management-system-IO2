import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

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
  isLocked: boolean;
  assignedBranch?: Branch | null;
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
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "FINANCE" | "USERS" | "BRANCHES" | "PRICING" | "COMPLAINTS"
  >("FINANCE");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [revenue, setRevenue] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [resolvingComplaint, setResolvingComplaint] =
    useState<Complaint | null>(null);
  const [resolveForm, setResolveForm] = useState({
    message: "",
    parcelAction: "RETURNED",
  });

  // Stany dla formularza placówek
  const [branchForm, setBranchForm] = useState<Branch>({
    name: "",
    address: "",
    type: "POST_OFFICE",
  });
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
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

  // --- LOGIKA PLACÓWEK ---
  const handleBranchSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranchId) {
        await api.put(`/branches/${editingBranchId}`, branchForm);
        addToast("Placówka zaktualizowana!", "success");
      } else {
        await api.post("/branches", branchForm);
        addToast("Placówka dodana!", "success");
      }
      setBranchForm({ name: "", address: "", type: "POST_OFFICE" });
      setEditingBranchId(null);
      fetchData();
    } catch {
      addToast("Błąd zapisu placówki", "error");
    }
  };

  const handleEditBranchClick = (branch: Branch) => {
    setBranchForm(branch);
    setEditingBranchId(branch.id!);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Przewiń do formularza
  };

  const handleDeleteBranch = async (id: number) => {
    if (!window.confirm("Czy na pewno usunąć tę placówkę?")) return;
    try {
      await api.delete(`/branches/${id}`);
      addToast("Usunięto placówkę", "success");
      fetchData();
    } catch {
      addToast("Błąd usuwania", "error");
    }
  };

  // --- LOGIKA UŻYTKOWNIKÓW ---
  const changeUserRole = async (id: number, newRole: string) => {
    try {
      await api.put(`/users/${id}/role?newRole=${newRole}`);
      addToast("Rola zmieniona", "success");
      fetchData();
    } catch {
      addToast("Błąd zmiany roli", "error");
    }
  };

  const toggleUserLock = async (id: number) => {
    try {
      await api.put(`/users/${id}/toggle-lock`);
      addToast("Zmieniono status blokady", "success");
      fetchData();
    } catch {
      addToast("Błąd operacji", "error");
    }
  };

  const assignUserBranch = async (userId: number, branchId: string) => {
    try {
      const param = branchId ? `?branchId=${branchId}` : "";
      await api.put(`/users/${userId}/branch${param}`);
      addToast("Przypisano placówkę do pracownika", "success");
      fetchData();
    } catch {
      addToast("Błąd przypisywania placówki", "error");
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm("Trwałe usunięcie konta. Kontynuować?")) return;
    try {
      await api.delete(`/users/${id}`);
      addToast("Konto usunięte", "success");
      fetchData();
    } catch {
      addToast(
        "Nie można usunąć konta z historią paczek! Zablokuj je zamiast tego.",
        "error",
      );
    }
  };

  const handleUserEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUser!.id}/details`, userForm);
      addToast("Dane użytkownika zostały zaktualizowane!", "success");
      setEditingUser(null);
      fetchData();
    } catch {
      addToast("Błąd aktualizacji. Email może być zajęty.", "error");
    }
  };

  // --- INNE ---
  const updatePricing = async (p: Pricing) => {
    try {
      await api.put(`/pricings/${p.id}`, p);
      addToast("Cennik zapisany!", "success");
      fetchData();
    } catch {
      addToast("Błąd zapisu", "error");
    }
  };

  const submitComplaintDecision = async (status: string) => {
    if (!resolvingComplaint) return;
    try {
      const params = new URLSearchParams();
      params.append("status", status);
      if (resolveForm.message)
        params.append("responseMessage", resolveForm.message);
      if (resolveForm.parcelAction)
        params.append("parcelAction", resolveForm.parcelAction);

      await api.put(
        `/complaints/${resolvingComplaint.id}/resolve?${params.toString()}`,
      );
      addToast(`Reklamacja została rozpatrzona (${status})`, "success");
      setResolvingComplaint(null);
      fetchData();
    } catch {
      addToast("Błąd rozpatrywania reklamacji", "error");
    }
  };

  return (
    <div className="bg-white rounded shadow min-h-[600px]">
      <div className="flex border-b overflow-x-auto">
        {[
          { key: "FINANCE", label: "Finanse" },
          { key: "USERS", label: "Użytkownicy" },
          { key: "BRANCHES", label: "Placówki" },
          { key: "PRICING", label: "Cennik" },
          { key: "COMPLAINTS", label: "Reklamacje" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap ${activeTab === tab.key ? "border-b-4 border-blue-600 text-blue-800" : "text-gray-500 hover:text-gray-800"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
          <div className="space-y-4 overflow-x-auto">
            <h2 className="text-xl font-bold text-blue-800">
              Zarządzanie Użytkownikami
            </h2>
            <table className="min-w-full text-left bg-white border whitespace-nowrap">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b">Email / Dane</th>
                  <th className="p-3 border-b">Rola</th>
                  <th className="p-3 border-b">Przydział</th>
                  <th className="p-3 border-b text-center">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b text-center">
                      {u.isLocked ? (
                        <span className="flex items-center text-red-600 font-bold justify-center">
                          <span className="w-3 h-3 bg-red-600 rounded-full mr-2 shadow-[0_0_5px_rgba(220,38,38,0.8)]"></span>
                          Zablokowany
                        </span>
                      ) : (
                        <span className="flex items-center text-green-600 font-bold justify-center">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                          Aktywny
                        </span>
                      )}
                    </td>
                    <td className="p-3 border-b">
                      <div className="font-bold text-gray-800">{u.email}</div>
                      <div className="text-sm text-gray-600">
                        {u.firstName} {u.lastName}
                      </div>
                    </td>
                    <td className="p-3 border-b">
                      <select
                        value={u.role}
                        onChange={(e) => changeUserRole(u.id, e.target.value)}
                        className="border px-2 py-1 rounded bg-white text-sm font-bold text-gray-700"
                      >
                        <option value="CLIENT">Klient</option>
                        <option value="COURIER">Kurier</option>
                        <option value="SORTING_WORKER">Sortownia</option>
                        <option value="CUSTOMER_SERVICE">Okienko</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="p-3 border-b">
                      <select
                        value={u.assignedBranch?.id || ""}
                        onChange={(e) => assignUserBranch(u.id, e.target.value)}
                        disabled={["CLIENT", "ADMIN"].includes(u.role)}
                        className="border px-2 py-1 rounded bg-white text-sm max-w-[150px]"
                      >
                        <option value="">-- Brak --</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 border-b text-center space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setUserForm({
                            firstName: u.firstName,
                            lastName: u.lastName,
                            email: u.email,
                            password: "",
                          });
                        }}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 font-bold text-xs rounded text-blue-800"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => toggleUserLock(u.id)}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 font-bold text-xs rounded text-gray-800"
                      >
                        Blokada
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "BRANCHES" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-red-800">
              Placówki i Sortownie
            </h2>
            <form
              onSubmit={handleBranchSave}
              className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded border items-center"
            >
              <input
                type="text"
                placeholder="Nazwa (np. UP Kielce 1)"
                required
                className="px-3 py-2 border rounded flex-1 min-w-[200px]"
                value={branchForm.name}
                onChange={(e) =>
                  setBranchForm({ ...branchForm, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Adres"
                required
                className="px-3 py-2 border rounded flex-1 min-w-[200px]"
                value={branchForm.address}
                onChange={(e) =>
                  setBranchForm({ ...branchForm, address: e.target.value })
                }
              />
              <select
                className="px-3 py-2 border rounded"
                value={branchForm.type}
                onChange={(e) =>
                  setBranchForm({ ...branchForm, type: e.target.value })
                }
              >
                <option value="POST_OFFICE">Urząd Pocztowy</option>
                <option value="SORTING_CENTER">Sortownia</option>
              </select>
              <button
                type="submit"
                className={`px-6 py-2 text-white font-bold rounded ${editingBranchId ? "bg-orange-500" : "bg-red-600"}`}
              >
                {editingBranchId ? "Zapisz Zmiany" : "Dodaj Nową"}
              </button>
              {editingBranchId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBranchId(null);
                    setBranchForm({
                      name: "",
                      address: "",
                      type: "POST_OFFICE",
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:underline"
                >
                  Anuluj
                </button>
              )}
            </form>
            <ul className="space-y-2 mt-6">
              {branches.map((b) => (
                <li
                  key={b.id}
                  className="p-4 border rounded flex justify-between items-center bg-white shadow-sm"
                >
                  <div>
                    <span className="font-bold text-lg">{b.name}</span>{" "}
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-2 uppercase text-gray-700 font-bold">
                      {b.type}
                    </span>
                    <div className="text-gray-500 text-sm mt-1">
                      {b.address}
                    </div>
                  </div>
                  <div className="space-x-4">
                    <button
                      onClick={() => handleEditBranchClick(b)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(b.id!)}
                      className="text-red-600 font-bold hover:underline"
                    >
                      Usuń
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "PRICING" && (
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
                                    weightMultiplier: parseFloat(
                                      e.target.value,
                                    ),
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
        )}

        {activeTab === "COMPLAINTS" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-orange-800 mb-4">
                Oczekujące Zgłoszenia
              </h2>
              <ul className="space-y-3">
                {complaints
                  .filter((c) => c.status === "PENDING")
                  .map((c) => (
                    <li
                      key={c.id}
                      className="p-4 border border-orange-300 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center bg-orange-50 gap-4"
                    >
                      <div>
                        <div className="font-bold text-lg">
                          Paczka:{" "}
                          <span
                            className="text-blue-600 hover:underline cursor-pointer"
                            onClick={() =>
                              window.open(
                                "/tracking?q=" + c.parcel.trackingNumber,
                              )
                            }
                          >
                            {c.parcel.trackingNumber}
                          </span>
                        </div>
                        <div className="text-sm italic mt-1 text-gray-700">
                          Zgłoszenie: "{c.reason}"
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {/* ZMIENIONE PRZYCISKI - Otwierają Modal */}
                        <button
                          onClick={() => {
                            setResolvingComplaint(c);
                            setResolveForm({
                              message: "",
                              parcelAction: "RETURNED",
                            });
                          }}
                          className="px-6 py-2 bg-gray-800 text-white font-bold rounded shadow hover:bg-gray-900 transition"
                        >
                          Rozpatrz Zgłoszenie
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
              {complaints.filter((c) => c.status === "PENDING").length ===
                0 && <p className="text-gray-500">Brak nowych reklamacji.</p>}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-4 border-t pt-6">
                Archiwum Rozpatrzonych
              </h2>
              <ul className="space-y-2 opacity-75">
                {complaints
                  .filter((c) => c.status !== "PENDING")
                  .map((c) => (
                    <li
                      key={c.id}
                      className="p-3 border rounded flex justify-between bg-gray-50"
                    >
                      <div>
                        <span className="font-bold">
                          {c.parcel.trackingNumber}
                        </span>{" "}
                        - "{c.reason}"
                      </div>
                      <div
                        className={`font-bold ${c.status === "ACCEPTED" ? "text-green-600" : "text-red-600"}`}
                      >
                        {c.status}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-blue-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Edycja Użytkownika</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="font-bold text-xl hover:text-red-300"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUserEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Email (Login)
                </label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700">
                    Imię
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.firstName}
                    onChange={(e) =>
                      setUserForm({ ...userForm, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700">
                    Nazwisko
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.lastName}
                    onChange={(e) =>
                      setUserForm({ ...userForm, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <label className="block text-sm font-bold text-red-700">
                  Zmień hasło (Zostaw puste, aby zachować obecne)
                </label>
                <input
                  type="password"
                  placeholder="Nowe hasło..."
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded border-red-300"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 mt-4 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700"
              >
                Zapisz Dane
              </button>
            </form>
          </div>
        </div>
      )}
      {resolvingComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="bg-orange-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Rozpatrywanie Reklamacji</h3>
              <button
                onClick={() => setResolvingComplaint(null)}
                className="font-bold text-xl hover:text-orange-200 transition"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                  Zgłoszenie (Paczka: {resolvingComplaint.parcel.trackingNumber}
                  )
                </p>
                <p className="text-gray-800 italic">
                  "{resolvingComplaint.reason}"
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Odpowiedź dla klienta (Uzasadnienie)
                </label>
                <textarea
                  required
                  value={resolveForm.message}
                  onChange={(e) =>
                    setResolveForm({ ...resolveForm, message: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg h-24 focus:ring focus:border-orange-300"
                  placeholder="Wyjaśnij decyzję np. Paczka została uszkodzona..."
                ></textarea>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-bold text-red-700 mb-2">
                  Decyzja systemowa: Co zrobić z paczką?
                </label>
                <select
                  value={resolveForm.parcelAction}
                  onChange={(e) =>
                    setResolveForm({
                      ...resolveForm,
                      parcelAction: e.target.value,
                    })
                  }
                  className="w-full px-3 py-3 border-2 border-orange-200 rounded-lg font-bold text-gray-800 bg-orange-50"
                >
                  <option value="RETURNED">
                    Archiwizuj: Zwróć do nadawcy (RETURNED)
                  </option>
                  <option value="DELIVERED">
                    Archiwizuj: Oznacz jako Doręczoną (DELIVERED)
                  </option>
                  <option value="IN_SORTING">
                    Przywróć do obiegu: Trafia na Sortownię (IN_SORTING)
                  </option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Paczka jest obecnie zablokowana w stanie IN_COMPLAINT.
                  Wybierz, jak system ma postąpić z nią po zamknięciu
                  zgłoszenia.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => submitComplaintDecision("ACCEPTED")}
                  className="flex-1 py-3 bg-green-600 text-white font-black rounded shadow hover:bg-green-700 transition transform hover:-translate-y-1"
                >
                  UZNAJ (Akceptuj)
                </button>
                <button
                  type="button"
                  onClick={() => submitComplaintDecision("REJECTED")}
                  className="flex-1 py-3 bg-red-600 text-white font-black rounded shadow hover:bg-red-700 transition transform hover:-translate-y-1"
                >
                  ODRZUĆ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
