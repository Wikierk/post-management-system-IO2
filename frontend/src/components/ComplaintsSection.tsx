import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Pagination } from "./Pagination";
import { SearchFilter } from "./SearchFilter";
import { StatusBadge } from "./StatusBadge";

interface Complaint {
  id: number;
  parcel: { trackingNumber: string };
  reason: string;
  status: string;
  responseMessage?: string;
}

interface ComplaintsResponse {
  content: Complaint[];
  totalPages: number;
  totalElements: number;
  number: number;
}

interface ComplaintsSectionProps {
  onDataChanged: () => void;
}

export const ComplaintsSection: React.FC<ComplaintsSectionProps> = ({
  onDataChanged,
}) => {
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [resolvedComplaints, setResolvedComplaints] = useState<Complaint[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [resolvedPage, setResolvedPage] = useState(1);
  const [resolvedTotalPages, setResolvedTotalPages] = useState(0);
  const [resolvedTotalElements, setResolvedTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [resolvedSearchTerm, setResolvedSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [resolvingComplaint, setResolvingComplaint] =
    useState<Complaint | null>(null);
  const [resolveForm, setResolveForm] = useState({
    message: "",
    parcelAction: "RETURNED",
  });

  const ITEMS_PER_PAGE = 5;

  const fetchPendingComplaints = async (
    page: number = 1,
    search: string = "",
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", (page - 1).toString());
      params.append("size", ITEMS_PER_PAGE.toString());
      params.append("status", "PENDING");
      if (search) params.append("search", search);

      const response = await api.get<ComplaintsResponse>(
        `/complaints/paginated?${params.toString()}`,
      );
      setComplaints(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(page);
    } catch {
      addToast("Błąd ładowania reklamacji", "error");
    }
  };

  const fetchResolvedComplaints = async (
    page: number = 1,
    search: string = "",
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", (page - 1).toString());
      params.append("size", ITEMS_PER_PAGE.toString());
      if (search) params.append("search", search);

      // Fetch both ACCEPTED and REJECTED, then combine
      const acceptedRes = await api.get<ComplaintsResponse>(
        `/complaints/paginated?${new URLSearchParams({
          page: "0",
          size: "100",
          status: "ACCEPTED",
          search: search || "",
        }).toString()}`,
      );

      const rejectedRes = await api.get<ComplaintsResponse>(
        `/complaints/paginated?${new URLSearchParams({
          page: "0",
          size: "100",
          status: "REJECTED",
          search: search || "",
        }).toString()}`,
      );

      const combined = [
        ...acceptedRes.data.content,
        ...rejectedRes.data.content,
      ];
      combined.sort(
        (a, b) =>
          new Date(b.id as any).getTime() - new Date(a.id as any).getTime(),
      );

      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      setResolvedComplaints(combined.slice(startIdx, endIdx));
      setResolvedTotalElements(combined.length);
      setResolvedTotalPages(Math.ceil(combined.length / ITEMS_PER_PAGE));
      setResolvedPage(page);
    } catch {
      addToast("Błąd ładowania archiwum reklamacji", "error");
    }
  };

  useEffect(() => {
    fetchPendingComplaints(1, searchTerm);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchPendingComplaints(1, value);
  };

  const handleResolvedSearch = (value: string) => {
    setResolvedSearchTerm(value);
    setResolvedPage(1);
    fetchResolvedComplaints(1, value);
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
      fetchPendingComplaints(currentPage, searchTerm);
      fetchResolvedComplaints(1, resolvedSearchTerm);
      onDataChanged();
    } catch {
      addToast("Błąd rozpatrywania reklamacji", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => {
            setActiveTab("pending");
            if (complaints.length === 0) fetchPendingComplaints(1, searchTerm);
          }}
          className={`px-6 py-3 font-bold transition border-b-4 ${
            activeTab === "pending"
              ? "border-orange-500 text-orange-700 bg-orange-50"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          Oczekujące ({totalElements})
        </button>
        <button
          onClick={() => {
            setActiveTab("resolved");
            if (resolvedComplaints.length === 0)
              fetchResolvedComplaints(1, resolvedSearchTerm);
          }}
          className={`px-6 py-3 font-bold transition border-b-4 ${
            activeTab === "resolved"
              ? "border-green-500 text-green-700 bg-green-50"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
        >
          Historia ({resolvedTotalElements})
        </button>
      </div>

      {/* Pending Complaints Tab */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-orange-800">
              Oczekujące Zgłoszenia
            </h2>
            <SearchFilter
              value={searchTerm}
              placeholder="Szukaj po tracking number..."
              onChange={handleSearch}
            />
          </div>

          <ul className="space-y-3">
            {complaints.map((c) => (
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
                        window.open("/tracking?q=" + c.parcel.trackingNumber)
                      }
                    >
                      {c.parcel.trackingNumber}
                    </span>
                  </div>
                  <div className="text-sm italic mt-1 text-gray-700">
                    Zgłoszenie: "{c.reason}"
                  </div>
                </div>
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
              </li>
            ))}
          </ul>

          {totalElements === 0 && (
            <p className="text-gray-500">Brak nowych reklamacji.</p>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => fetchPendingComplaints(page, searchTerm)}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalElements}
            />
          )}
        </div>
      )}

      {/* Resolved Complaints Tab */}
      {activeTab === "resolved" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-green-800">
              Historia Rozpatrywania
            </h2>
            <SearchFilter
              value={resolvedSearchTerm}
              placeholder="Szukaj po tracking number..."
              onChange={handleResolvedSearch}
            />
          </div>

          <ul className="space-y-3">
            {resolvedComplaints.map((c) => (
              <li
                key={c.id}
                className={`p-4 border rounded flex flex-col gap-3 ${
                  c.status === "ACCEPTED"
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg">
                      Paczka:{" "}
                      <span
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() =>
                          window.open("/tracking?q=" + c.parcel.trackingNumber)
                        }
                      >
                        {c.parcel.trackingNumber}
                      </span>
                    </div>
                    <div className="text-sm mt-1 text-gray-700">
                      Zgłoszenie: "{c.reason}"
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                {c.responseMessage && (
                  <div className="bg-white bg-opacity-50 border-l-4 border-gray-400 pl-3 text-sm text-gray-800">
                    <span className="font-bold">Odpowiedź:</span>{" "}
                    {c.responseMessage}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {resolvedTotalElements === 0 && (
            <p className="text-gray-500">Brak rozpatrzonych reklamacji.</p>
          )}

          {resolvedTotalPages > 1 && (
            <Pagination
              currentPage={resolvedPage}
              totalPages={resolvedTotalPages}
              onPageChange={(page) =>
                fetchResolvedComplaints(page, resolvedSearchTerm)
              }
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={resolvedTotalElements}
            />
          )}
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
