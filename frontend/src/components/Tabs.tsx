import React from "react";

interface TabItem {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: "default" | "pills";
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onChange,
  variant = "default",
}) => {
  if (variant === "pills") {
    return (
      <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-lg">
        {items.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 text-xs font-black">({tab.count})</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex border-b overflow-x-auto">
      {items.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition ${
            activeTab === tab.key
              ? "border-b-4 border-blue-600 text-blue-800"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 text-xs">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};
