// CLSX
import clsx from "clsx";

// LUCIDE
import { FileText } from "lucide-react";

// TYPESCRIPT
type Props = {
  icon: string | null;
  title: string;
  snippet?: string;
  selected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
};

const SearchResultItem = ({
  icon,
  title,
  snippet,
  selected,
  onClick,
  onMouseEnter,
}: Props) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={clsx(
        "flex w-full items-start gap-3 px-4 py-2 text-left transition-colors duration-[80ms]",
        selected ? "bg-surface-2" : "hover:bg-surface-2/50",
      )}
    >
      <span className="mt-0.5 flex-shrink-0 text-base">
        {icon || <FileText size={16} className="text-text-faint" />}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${selected ? "text-text" : "text-text-muted"}`}
        >
          {title || "Untitled"}
        </p>
        {snippet && (
          <p className="mt-0.5 truncate text-xs text-text-faint">{snippet}</p>
        )}
      </div>
    </button>
  );
};

export default SearchResultItem;
