// REACT
import { useState } from "react";

// LUCIDE
import { ExternalLink } from "lucide-react";

// TYPESCRIPT
type Props = {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
};

const URLCell = ({ value, onChange, editable }: Props) => {
  // States
  const [editing, setEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>(value);

  // Case - Not Editable or Not Editing
  if (!editable || !editing) {
    return (
      <div
        className="flex items-center gap-1 px-2 py-1 min-h-[24px]"
        onClick={() => {
          if (editable) {
            setDraft(value);
            setEditing(true);
          }
        }}
      >
        {value ? (
          <>
            <span className="truncate text-sm text-accent-light underline cursor-pointer">
              {value}
            </span>
            <ExternalLink size={12} className="flex-shrink-0 text-text-muted" />
          </>
        ) : (
          <span className="text-sm text-text-faint cursor-text">Empty</span>
        )}
      </div>
    );
  }

  return (
    <input
      type="url"
      className="w-full bg-transparent px-2 py-1 text-sm text-text outline-none ring-1 ring-accent rounded"
      value={draft}
      placeholder="https://..."
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft(e.target.value)
      }
      onBlur={() => {
        setEditing(false);
        if (draft !== value) onChange(draft);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          setEditing(false);
          if (draft !== value) onChange(draft);
        } else if (e.key === "Escape") {
          setEditing(false);
          setDraft(value);
        }
      }}
      autoFocus
    />
  );
};

export default URLCell;
