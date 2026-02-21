// REACT
import { useState } from "react";

// CLSX
import clsx from "clsx";

// LUCIDE
import { Check } from "lucide-react";

// TYPESCRIPT
type Props = {
  value: string;
  options: string;
  onChange: (v: string) => void;
  editable: boolean;
};

const SelectCell = ({
  value,
  options: optionsJson,
  onChange,
  editable,
}: Props) => {
  // States
  const [open, setOpen] = useState<boolean>(false);

  // Parse Options
  let selectOptions: Array<{ label: string; color: string }> = [];
  try {
    const parsed = JSON.parse(optionsJson);
    if (Array.isArray(parsed.options)) {
      selectOptions = parsed.options;
    }
  } catch {
    // ignore
    // TODO: What are we doing here wtf
  }

  // Find Selected Option
  const selectedOption = selectOptions.find((o) => o.label === value);

  return (
    <div className="relative px-2 py-1">
      <button
        className={clsx(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-[80ms]",
          selectedOption ? `bg-accent/20 text-accent-light` : "text-text-faint",
        )}
        onClick={() => editable && setOpen(!open)}
      >
        {value || "Select..."}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-30 mt-1 min-w-[140px] rounded-md border border-border bg-surface p-1 shadow-lg">
            {selectOptions.map((opt, index) => (
              <button
                key={index}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-text transition-colors duration-[80ms] hover:bg-surface-2"
                onClick={() => {
                  onChange(opt.label);
                  setOpen(false);
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: opt.color || "var(--color-accent)",
                  }}
                />
                {opt.label}
                {opt.label === value && (
                  <Check size={12} className="ml-auto text-accent" />
                )}
              </button>
            ))}
            {selectOptions.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-text-faint">
                No options configured
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SelectCell;
