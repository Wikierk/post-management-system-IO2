import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {totalItems && itemsPerPage && (
        <p className="text-sm text-gray-600">
          Wyświetlanie <span className="font-bold">{itemsPerPage}</span> z{" "}
          <span className="font-bold">{totalItems}</span> elementów
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ← Poprzednia
        </button>

        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..." || page === currentPage}
            className={`px-3 py-2 rounded font-bold transition ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : page === "..."
                  ? "cursor-default"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Następna →
        </button>
      </div>
    </div>
  );
};
