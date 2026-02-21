// TYPESCRIPT
type Props = {
  title: string;
  description?: string;
};

const SettingSectionHeader = ({ title, description }: Props) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      )}
    </div>
  );
};

export default SettingSectionHeader;
