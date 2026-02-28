// REACT
import React from "react";

// Render inline markdown: **bold**, *italic*, `code`
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code: `text`
    const codeMatch = remaining.match(/`(.+?)`/);
    // Italic: *text* (but not **)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    // Find the earliest match
    const matches = [
      boldMatch && { type: "bold", match: boldMatch },
      codeMatch && { type: "code", match: codeMatch },
      italicMatch && { type: "italic", match: italicMatch },
    ].filter(Boolean) as { type: string; match: RegExpMatchArray }[];

    if (matches.length === 0) {
      nodes.push(remaining);
      break;
    }

    const earliest = matches.reduce((a, b) =>
      (a.match.index ?? 0) < (b.match.index ?? 0) ? a : b,
    );

    const idx = earliest.match.index ?? 0;

    // Text before the match
    if (idx > 0) {
      nodes.push(remaining.slice(0, idx));
    }

    if (earliest.type === "bold") {
      nodes.push(
        <strong key={key++} className="font-semibold text-text">
          {earliest.match[1]}
        </strong>,
      );
    } else if (earliest.type === "code") {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-surface-2 px-1 py-0.5 font-mono text-xs"
        >
          {earliest.match[1]}
        </code>,
      );
    } else if (earliest.type === "italic") {
      nodes.push(
        <em key={key++} className="italic">
          {earliest.match[1]}
        </em>,
      );
    }

    remaining = remaining.slice(idx + earliest.match[0].length);
  }

  return nodes;
}

const SummaryContent = ({ text }: { text: string }) => {
  const lines: string[] = text.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line: string, i: number) => {
        const trimmed: string = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // H1: # Header
        if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="mt-3 text-sm font-bold text-text"
            >
              {renderInline(trimmed.slice(2))}
            </h2>
          );
        }

        // H2: ## Header
        if (trimmed.startsWith("## ") && !trimmed.startsWith("### ")) {
          return (
            <h3
              key={i}
              className="mt-3 text-xs font-semibold uppercase tracking-wider text-ai"
            >
              {renderInline(trimmed.slice(3))}
            </h3>
          );
        }

        // H3: ### Header
        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={i}
              className="mt-2 text-xs font-semibold text-text"
            >
              {renderInline(trimmed.slice(4))}
            </h4>
          );
        }

        // Bullet: - text
        if (trimmed.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2 text-text">
              <span className="mt-0.5 flex-shrink-0 text-text-faint">
                &#8226;
              </span>
              <span>{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        // Numbered list: 1. text
        const numberedMatch = trimmed.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 text-text">
              <span className="mt-0.5 flex-shrink-0 text-text-faint">
                {numberedMatch[1]}.
              </span>
              <span>{renderInline(numberedMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={i} className="text-text">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export default SummaryContent;
