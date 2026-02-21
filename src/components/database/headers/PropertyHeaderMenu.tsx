// REACT
import { useState } from "react";

// STORE
import { useDatabaseStore } from "@/stores/database";

// DATA
import { PROPERTY_TYPES } from "@/data/property";

// CLSX
import clsx from "clsx";

// LUCIDE
import { Trash2 } from "lucide-react";

// TYPES
import type { PropertyType } from "@/types";

// TYPESCRIPT
type Props = {
  propertyId: string;
  propertyName: string;
  propertyType: PropertyType;
  onClose: () => void;
};

export function PropertyHeaderMenu({
  propertyId,
  propertyName,
  propertyType,
  onClose,
}: Props) {
  // States
  const [name, setName] = useState<string>(propertyName);

  // Stores
  const { updateProperty, removeProperty } = useDatabaseStore();

  // Handler - Rename Property
  const handleRename = async () => {
    if (name !== propertyName && name.trim()) {
      await updateProperty(propertyId, { name: name.trim() });
    }
  };

  // Handler - Change Property Type
  const handleChangeType = async (type: PropertyType) => {
    await updateProperty(propertyId, { type });
    onClose();
  };

  // Handler - Delete Property
  const handleDelete = async () => {
    await removeProperty(propertyId);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute left-0 top-full z-30 mt-1 min-w-[220px] rounded-md border border-border bg-surface shadow-lg">
        {/* NAME INPUT */}
        <div className="border-b border-border p-2">
          <input
            className="w-full rounded bg-surface-2 px-2 py-1 text-sm text-text outline-none focus:ring-1 focus:ring-accent"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            onBlur={handleRename}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleRename();
            }}
            autoFocus
          />
        </div>

        {/* TYPE SELECTOR */}
        <div className="border-b border-border p-1">
          <div className="px-2 py-1 text-xs font-medium text-text-faint">
            Type
          </div>
          {PROPERTY_TYPES.map((pt, index) => (
            <button
              key={index}
              className={clsx(
                "flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors duration-[80ms] hover:bg-surface-2",
                pt.value === propertyType
                  ? "text-accent-light"
                  : "text-text-muted hover:text-text",
              )}
              onClick={() => handleChangeType(pt.value)}
            >
              {pt.icon}
              {pt.label}
            </button>
          ))}
        </div>

        {/* DELETE */}
        <div className="p-1">
          <button
            className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-red-400 transition-colors duration-[80ms] hover:bg-red-500/10"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
            Delete property
          </button>
        </div>
      </div>
    </>
  );
}

export default PropertyHeaderMenu;
