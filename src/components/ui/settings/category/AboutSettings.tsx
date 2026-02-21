// COMPONENTS
import SettingSectionHeader from "../headers/SettingSectionHeader";

const AboutSettings = () => {
  return (
    <div>
      <SettingSectionHeader title="About" />
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold text-text">
            Seekbase
          </span>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-muted">
            v0.1.0
          </span>
        </div>
        <p className="text-sm text-text-muted">
          Your second brain. Fully yours.
        </p>
        <div className="space-y-2 text-sm text-text-faint">
          <p>Built with Tauri v2 + Next.js 14</p>
          <p>Local-first. No cloud. No tracking.</p>
          <p>AI powered by Ollama (on-device)</p>
        </div>
      </div>
    </div>
  );
};

export default AboutSettings;
