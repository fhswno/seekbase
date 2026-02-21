// TYPESCRIPT
type Props = {
  label: string;
  description?: string;
  children: React.ReactNode;
};

const SettingRow = ({ label, description, children }: Props) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-text-muted">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
};

export default SettingRow;
