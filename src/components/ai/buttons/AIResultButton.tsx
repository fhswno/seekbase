// TYPESCRIPT
type Props = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

const AIResultButton = ({ icon, label, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
    >
      {icon}
      {label}
    </button>
  );
};

export default AIResultButton;
