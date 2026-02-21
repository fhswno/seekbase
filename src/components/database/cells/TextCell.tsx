// REACT
import { useState } from "react";

// TYPESCRIPT
type Props = {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
};

const TextCell = ({ value, onChange, editable }: Props) => {
  // States
  const [editing, setEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>(value);

  // Case - Not Editable or Not Editing
  if (!editable || !editing) {
    return (
      <div
        className="min-h-[24px] cursor-text truncate px-2 py-1 text-sm text-text"
        onClick={() => {
          if (editable) {
            setDraft(value);
            setEditing(true);
          }
        }}
      >
        {value || <span className="text-text-faint">Empty</span>}
      </div>
    );
  }

  return (
    <input
      className="w-full bg-transparent px-2 py-1 text-sm text-text outline-none ring-1 ring-accent rounded"
      value={draft}
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

export default TextCell;
