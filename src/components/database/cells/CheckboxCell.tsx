// CLSX
import clsx from "clsx";

// TYPES
import { Check } from "lucide-react";

// TYPESCRIPT
type Props = {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
};

const CheckboxCell = ({ value, onChange, editable }: Props) => {
  // Computed - Checked
  const checked: boolean = value === "true" || value === "1";

  return (
    <div className="flex items-center px-2 py-1">
      <button
        className={clsx(
          "flex h-4 w-4 items-center justify-center rounded-sm border transition-colors duration-[80ms]",
          checked
            ? "border-accent bg-accent"
            : "border-text-faint hover:border-text-muted",
        )}
        onClick={() => editable && onChange(checked ? "false" : "true")}
        disabled={!editable}
      >
        {checked && <Check size={12} className="text-white" />}
      </button>
    </div>
  );
};

export default CheckboxCell;
