// CLSX
import clsx from "clsx";

// TYPESCRIPT
type Props = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

const PageMenuItem = ({ icon, label, onClick, destructive }: Props) => {
  return (
    <button
      onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        onClick();
      }}
      className={clsx(
        "flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors duration-[80ms]",
        destructive
          ? "text-red-400 hover:bg-red-400/10"
          : "text-text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {icon}
      {label}
    </button>
  );
};

export default PageMenuItem;
