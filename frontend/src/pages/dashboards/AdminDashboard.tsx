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

export const AdminDashboard: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [newBranch, setNewBranch] = useState<Branch>({
    name: "",
    address: "",
    type: "POST_OFFICE",
  });
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [revenue, setRevenue] = useState<number>(0);

  const fetchData = async () => {
    const resBranches = await api.get("/branches");
    setBranches(resBranches.data);

    const resComplaints = await api.get("/complaints/all");
    setComplaints(resComplaints.data);

    const resRevenue = await api.get("/parcels/finance-report");
    setRevenue(resRevenue.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ... (handleCreate i handleDelete dla placówek pozostają)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/branches", newBranch);
    setNewBranch({ name: "", address: "", type: "POST_OFFICE" });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/branches/${id}`);
    fetchData();
  };

  const resolveComplaint = async (id: number, status: string) => {
    await api.put(`/complaints/${id}/resolve?status=${status}`);
    fetchData();
  };

  return (
    <div className="space-y-8">
      {/* RAPORT FINANSOWY */}
      <div className="bg-green-50 p-6 rounded shadow border-l-4 border-green-600">
        <h2 className="text-xl font-bold text-green-800">
          Raport Finansowy (Przychody)
        </h2>
        <p className="text-3xl font-black mt-2">{revenue} PLN</p>
      </div>

      {/* PLACÓWKI */}
      <div className="bg-white p-6 rounded shadow border-t-4 border-red-600">
        <h2 className="text-xl font-bold mb-4 text-red-800">
          Zarządzanie Placówkami
        </h2>
        <form
          onSubmit={handleCreate}
          className="flex space-x-2 mb-6 p-4 bg-gray-50 rounded border"
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
                className="text-red-600 font-bold"
              >
                X
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* REKLAMACJE */}
      <div className="bg-white p-6 rounded shadow border-t-4 border-orange-500">
        <h2 className="text-xl font-bold mb-4 text-orange-800">
          Rozpatrywanie Reklamacji
        </h2>
        <ul className="space-y-3">
          {complaints.map((c) => (
            <li
              key={c.id}
              className="p-4 border rounded flex justify-between items-center bg-orange-50"
            >
              <div>
                <div className="font-bold">
                  Paczka: {c.parcel.trackingNumber}
                </div>
                <div className="text-sm italic">"{c.reason}"</div>
                <div className="text-xs font-semibold mt-1">
                  Status: {c.status}
                </div>
              </div>
              {c.status === "PENDING" && (
                <div className="space-x-2">
                  <button
                    onClick={() => resolveComplaint(c.id, "ACCEPTED")}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    Akceptuj
                  </button>
                  <button
                    onClick={() => resolveComplaint(c.id, "REJECTED")}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Odrzuć
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
