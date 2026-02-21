// LUCIDE
import { AlertCircle } from "lucide-react";

const OllamaOffline = () => {
  return (
    <div className="rounded-md bg-surface-2 p-4 text-center">
      <AlertCircle size={24} className="mx-auto text-text-faint" />
      <h4 className="mt-2 text-sm font-medium text-text">
        Ollama is not running
      </h4>
      <p className="mt-1 text-xs text-text-muted">
        Start Ollama to use AI features. Install it from{" "}
        <span className="text-accent-light">ollama.com</span> and run{" "}
        <code className="rounded bg-bg px-1 py-0.5 font-mono text-[10px]">
          ollama serve
        </code>
      </p>
    </div>
  );
};

export default OllamaOffline;
