// TYPESCRIPT
type Props = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

const AIToolbarButton = ({ icon, label, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default AIToolbarButton;
