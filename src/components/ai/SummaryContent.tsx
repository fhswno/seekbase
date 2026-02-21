const SummaryContent = ({ text }: { text: string }) => {
  // Lines
  const lines: string[] = text.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line: string, i: number) => {
        const trimmed: string = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={i}
              className="mt-3 text-xs font-semibold uppercase tracking-wider text-ai"
            >
              {trimmed.replace("## ", "")}
            </h3>
          );
        }

        if (trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 text-text">
              <span className="mt-0.5 text-text-faint">&#8226;</span>
              <span>{trimmed.replace("- ", "")}</span>
            </div>
          );
        }

        return (
          <p key={i} className="text-text">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};

export default SummaryContent;
