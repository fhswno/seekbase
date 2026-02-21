// TYPESCRIPT
type Props = {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
};

const DateCell = ({ value, onChange, editable }: Props) => {
  // Date String
  const dateStr: string = value
    ? new Date(parseInt(value) || value).toISOString().split("T")[0]
    : "";

  return (
    <div className="px-2 py-1">
      {editable ? (
        <input
          type="date"
          className="bg-transparent text-sm text-text outline-none"
          value={dateStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const ts: number = new Date(e.target.value).getTime();
            onChange(ts.toString());
          }}
        />
      ) : (
        <span className="text-sm text-text">
          {dateStr || <span className="text-text-faint">No date</span>}
        </span>
      )}
    </div>
  );
};

export default DateCell;
