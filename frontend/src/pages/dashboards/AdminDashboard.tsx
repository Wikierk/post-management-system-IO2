import React, { useEffect, useState } from "react";
import api from "../../api/axios";

interface Branch {
  id?: number;
  name: string;
  address: string;
  type: string;
}

export const AdminDashboard: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [newBranch, setNewBranch] = useState<Branch>({
    name: "",
    address: "",
    type: "POST_OFFICE",
  });

  const fetchBranches = async () => {
    const res = await api.get("/branches");
    setBranches(res.data);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/branches", newBranch);
    setNewBranch({ name: "", address: "", type: "POST_OFFICE" });
    fetchBranches();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/branches/${id}`);
    fetchBranches();
  };

  return (
    <div className="bg-white p-6 rounded shadow border-t-4 border-red-600">
      <h2 className="text-xl font-bold mb-4 text-red-800">
        Panel Administratora: Zarządzanie Placówkami
      </h2>

      <form
        onSubmit={handleCreate}
        className="flex space-x-2 mb-6 p-4 bg-gray-50 rounded border"
      >
        <input
          type="text"
          placeholder="Nazwa (np. UP Kielce 1)"
          required
          className="px-3 py-2 border rounded flex-1"
          value={newBranch.name}
          onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
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
          onChange={(e) => setNewBranch({ ...newBranch, type: e.target.value })}
        >
          <option value="POST_OFFICE">Urząd Pocztowy</option>
          <option value="SORTING_CENTER">Sortownia</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Dodaj
        </button>
      </form>

      <ul className="space-y-2">
        {branches.map((b) => (
          <li
            key={b.id}
            className="p-3 border rounded flex justify-between items-center"
          >
            <div>
              <span className="font-bold">{b.name}</span> - {b.address}{" "}
              <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-2">
                {b.type}
              </span>
            </div>
            <button
              onClick={() => handleDelete(b.id!)}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
