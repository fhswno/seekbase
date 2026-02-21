// REACT
import { useState } from "react";

// STORE
import { useDatabaseStore } from "@/stores/database";

// CONSTANTS
import { PROPERTY_TYPES } from "@/data/property";

// LUCIDE
import { Plus } from "lucide-react";

// TYPES
import { PropertyType } from "@/types";

const AddPropertyButton = () => {
  // States
  const [open, setOpen] = useState<boolean>(false);

  // Stores
  const addProperty = useDatabaseStore((s) => s.addProperty);

  // Handler - Add Property
  const handleAdd = async (type: PropertyType) => {
    const label: string =
      PROPERTY_TYPES.find((t) => t.value === type)?.label ?? "Property";
    await addProperty(label, type);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-faint transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text-muted"
      >
        <Plus size={14} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-30 mt-1 min-w-[180px] rounded-md border border-border bg-surface p-1 shadow-lg">
            <div className="px-2 py-1 text-xs font-medium text-text-faint">
              Property type
            </div>
            {PROPERTY_TYPES.map((pt, index) => (
              <button
                key={index}
                className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
                onClick={() => handleAdd(pt.value)}
              >
                {pt.icon}
                {pt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AddPropertyButton;
