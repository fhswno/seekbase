const TimestampCell = ({ value }: { value: string }) => {
  // Timestamp
  const ts = parseInt(value);

  // Display
  const display = ts
    ? new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  return <div className="px-2 py-1 text-sm text-text-muted">{display}</div>;
};

export default TimestampCell;
