// STORE
import { useComponentsContext } from "@blocknote/react";

// LUCIDE
import { Sparkles } from "lucide-react";

const AIToolbarButton = ({ onTrigger }: { onTrigger: () => void }) => {
  // Context
  const Components = useComponentsContext();

  // Case - No Context
  if (!Components) return null;

  return (
    <Components.FormattingToolbar.Button
      className="bn-button"
      mainTooltip="Ask AI (⌘J)"
      onClick={onTrigger}
      icon={<Sparkles size={16} />}
      label="Ask AI"
    />
  );
};

export default AIToolbarButton;
