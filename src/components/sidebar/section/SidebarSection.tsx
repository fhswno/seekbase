// LUCIDE
import { Plus } from "lucide-react";

// TYPESCRIPT
type Props = {
  label: string;
  children: React.ReactNode;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
};

const SidebarSection = ({ label, children, onAction, actionIcon }: Props) => {
  return (
    <div>
      <div className="flex items-center justify-between px-4 py-1">
        <span className="text-xs font-medium uppercase tracking-wider text-text-faint">
          {label}
        </span>
        {onAction && (
          <button
            onClick={onAction}
            className="rounded-sm p-0.5 text-text-faint transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text-muted"
            title="New page"
          >
            {actionIcon ?? <Plus size={14} />}
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default SidebarSection;
