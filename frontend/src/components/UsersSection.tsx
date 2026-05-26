import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Pagination } from "./Pagination";
import { SearchFilter } from "./SearchFilter";
import { ConfirmDialog } from "./ConfirmDialog";

interface Branch {
  id?: number;
  name: string;
  address: string;
  type: string;
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

interface UsersResponse {
  content: User[];
  totalPages: number;
  totalElements: number;
  number: number;
}

interface UsersSectionProps {
  branches: Branch[];
  onDataChanged: () => void;
}

export const UsersSection: React.FC<UsersSectionProps> = ({
  branches,
  onDataChanged,
}) => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isDangerous: false,
    onConfirm: () => {},
  });

  const ITEMS_PER_PAGE = 5;

  const fetchUsers = async (page: number = 1, search: string = "") => {
    try {
      const params = new URLSearchParams();
      params.append("page", (page - 1).toString());
      params.append("size", ITEMS_PER_PAGE.toString());
      if (search) params.append("search", search);

      const response = await api.get<UsersResponse>(
        `/users/paginated?${params.toString()}`,
      );
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(page);
    } catch {
      addToast("Błąd ładowania użytkowników", "error");
    }
  };

  useEffect(() => {
    fetchUsers(1, searchTerm);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchUsers(1, value);
  };

  const changeUserRole = async (id: number, newRole: string) => {
    try {
      await api.put(`/users/${id}/role?newRole=${newRole}`);
      addToast("Rola zmieniona", "success");
      fetchUsers(currentPage, searchTerm);
      onDataChanged();
    } catch {
      addToast("Błąd zmiany roli", "error");
    }
  };

  const toggleUserLock = async (id: number) => {
    try {
      await api.put(`/users/${id}/toggle-lock`);
      addToast("Zmieniono status blokady", "success");
      fetchUsers(currentPage, searchTerm);
      onDataChanged();
    } catch {
      addToast("Błąd operacji", "error");
    }
  };

  const assignUserBranch = async (userId: number, branchId: string) => {
    try {
      const param = branchId ? `?branchId=${branchId}` : "";
      await api.put(`/users/${userId}/branch${param}`);
      addToast("Przypisano placówkę do pracownika", "success");
      fetchUsers(currentPage, searchTerm);
      onDataChanged();
    } catch {
      addToast("Błąd przypisywania placówki", "error");
    }
  };

  const deleteUser = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Usunąć użytkownika?",
      message: "Ta akcja bezpowrotnie usunie konto użytkownika. Kontynuować?",
      isDangerous: true,
      onConfirm: async () => {
        try {
          await api.delete(`/users/${id}`);
          addToast("Konto usunięte", "success");
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          fetchUsers(1, searchTerm);
          onDataChanged();
        } catch {
          addToast(
            "Nie można usunąć konta z historią paczek! Zablokuj je zamiast tego.",
            "error",
          );
        }
      },
    });
  };

  const handleUserEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUser!.id}/details`, userForm);
      addToast("Dane użytkownika zostały zaktualizowane!", "success");
      setEditingUser(null);
      fetchUsers(currentPage, searchTerm);
      onDataChanged();
    } catch {
      addToast("Błąd aktualizacji. Email może być zajęty.", "error");
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDangerous={confirmDialog.isDangerous}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-800">
          Zarządzanie Użytkownikami ({totalElements})
        </h2>
        <SearchFilter
          value={searchTerm}
          placeholder="Szukaj po email..."
          onChange={handleSearch}
        />
      </div>

      <div className="overflow-x-auto">
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
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 font-bold text-xs rounded text-red-800"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchUsers(page, searchTerm)}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={totalElements}
        />
      )}

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
    </div>
  );
};
