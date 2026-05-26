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

interface BranchesResponse {
  content: Branch[];
  totalPages: number;
  totalElements: number;
  number: number;
}

interface BranchesSectionProps {
  onDataChanged: () => void;
}

export const BranchesSection: React.FC<BranchesSectionProps> = ({
  onDataChanged,
}) => {
  const { addToast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchForm, setBranchForm] = useState<Branch>({
    name: "",
    address: "",
    type: "POST_OFFICE",
  });
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isDangerous: false,
    onConfirm: () => {},
  });

  const ITEMS_PER_PAGE = 5;

  const fetchBranches = async (page: number = 1, search: string = "") => {
    try {
      const params = new URLSearchParams();
      params.append("page", (page - 1).toString());
      params.append("size", ITEMS_PER_PAGE.toString());
      if (search) params.append("search", search);

      const response = await api.get<BranchesResponse>(
        `/branches/paginated?${params.toString()}`,
      );
      setBranches(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(page);
    } catch {
      addToast("Błąd ładowania placówek", "error");
    }
  };

  useEffect(() => {
    fetchBranches(1, searchTerm);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchBranches(1, value);
  };

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
      fetchBranches(1, searchTerm);
      onDataChanged();
    } catch {
      addToast("Błąd zapisu placówki", "error");
    }
  };

  const handleEditBranchClick = (branch: Branch) => {
    setBranchForm(branch);
    setEditingBranchId(branch.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteBranch = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Usunąć placówkę?",
      message: "Ta akcja bezpowrotnie usunie placówkę. Kontynuować?",
      isDangerous: true,
      onConfirm: async () => {
        try {
          await api.delete(`/branches/${id}`);
          addToast("Usunięto placówkę", "success");
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          fetchBranches(1, searchTerm);
          onDataChanged();
        } catch {
          addToast("Błąd usuwania", "error");
        }
      },
    });
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
        <h2 className="text-xl font-bold text-red-800">
          Placówki i Sortownie ({totalElements})
        </h2>
        <SearchFilter
          value={searchTerm}
          placeholder="Szukaj po nazwie..."
          onChange={handleSearch}
        />
      </div>

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

      <ul className="space-y-2">
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
              <div className="text-gray-500 text-sm mt-1">{b.address}</div>
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

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchBranches(page, searchTerm)}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={totalElements}
        />
      )}
    </div>
  );
};
