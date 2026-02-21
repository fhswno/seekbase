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

const MultiSelectCell = ({
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
  }

  // Parse Current Value
  let selectedValues: string[] = [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      selectedValues = parsed;
    }
  } catch {
    if (value) selectedValues = [value];
  }

  // Handler - Toggle Value
  const toggleValue = (label: string) => {
    const newValues = selectedValues.includes(label)
      ? selectedValues.filter((v) => v !== label)
      : [...selectedValues, label];
    onChange(JSON.stringify(newValues));
  };

  return (
    <div className="relative px-2 py-1">
      <div
        className="flex flex-wrap gap-1 cursor-pointer min-h-[24px]"
        onClick={() => editable && setOpen(!open)}
      >
        {selectedValues.length > 0 ? (
          selectedValues.map((v: string) => (
            <span
              key={v}
              className="inline-flex rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-light"
            >
              {v}
            </span>
          ))
        ) : (
          <span className="text-sm text-text-faint">Select...</span>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-30 mt-1 min-w-[140px] rounded-md border border-border bg-surface p-1 shadow-lg">
            {selectOptions.map((opt, index) => (
              <button
                key={index}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-text transition-colors duration-[80ms] hover:bg-surface-2"
                onClick={() => toggleValue(opt.label)}
              >
                <span
                  className={clsx(
                    "flex h-3.5 w-3.5 items-center justify-center rounded-sm border",
                    selectedValues.includes(opt.label)
                      ? "border-accent bg-accent"
                      : "border-border",
                  )}
                >
                  {selectedValues.includes(opt.label) && (
                    <Check size={10} className="text-white" />
                  )}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MultiSelectCell;
