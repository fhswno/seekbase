// TYPESCRIPT
type Props = {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
};

const SidebarButton = ({ icon, label, shortcut, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className="text-xs text-text-faint">{shortcut}</span>}
    </button>
  );
};

export default SidebarButton;
