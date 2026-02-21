// LUCIDE
import { Sparkles } from "lucide-react";

const NoModelSelected = () => {
  return (
    <div className="rounded-md bg-surface-2 p-4 text-center">
      <Sparkles size={24} className="mx-auto text-text-faint" />
      <h4 className="mt-2 text-sm font-medium text-text">No model selected</h4>
      <p className="mt-1 text-xs text-text-muted">
        Go to Settings to select an AI model.
      </p>
    </div>
  );
};

export default NoModelSelected;
