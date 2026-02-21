// REACT
import React, { useEffect, useState, useCallback } from "react";

// STORE
import { useSettingsStore } from "@/stores/settings";

// COMPONENTS
import SettingSectionHeader from "../headers/SettingSectionHeader";
import SettingRow from "../rows/SettingRow";

// CLSX
import clsx from "clsx";

// LIB
import * as ollama from "@/lib/ollama";
import * as mistral from "@/lib/mistral";

// ICONS
import { Check, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

const AISettings = () => {
  // State
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [loadingOllamaModels, setLoadingOllamaModels] =
    useState<boolean>(false);
  const [ollamaStatus, setOllamaStatus] = useState<boolean | null>(null);
  const [ollamaSaved, setOllamaSaved] = useState<boolean>(false);

  // Store
  const { getSetting, setSetting } = useSettingsStore();

  // Provider state
  const aiProvider = (getSetting("ai_provider") ?? "ollama") as
    | "ollama"
    | "mistral";

  // Ollama - Settings
  const baseUrl = getSetting("ollama_base_url") ?? "http://localhost:11434";
  const currentOllamaModel = getSetting("ollama_model") ?? "";

  // Mistral - Settings
  const [mistralApiKey, setMistralApiKeyLocal] = useState(
    getSetting("mistral_api_key") ?? "",
  );
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);
  const [mistralModels, setMistralModels] = useState<string[]>([]);
  const [loadingMistralModels, setLoadingMistralModels] =
    useState<boolean>(false);
  const [mistralSaved, setMistralSaved] = useState<boolean>(false);
  const currentMistralModel = getSetting("mistral_model") ?? "";

  // Autocomplete - Settings
  const autocompleteEnabled = getSetting("autocomplete_enabled") !== "false";
  const autocompleteDelay = getSetting("autocomplete_delay") ?? "1000";

  // Effect - Check Ollama, Fetch Models
  useEffect(() => {
    async function check() {
      const available = await ollama.checkOllamaStatus(baseUrl);
      setOllamaStatus(available);
      if (available) {
        setLoadingOllamaModels(true);
        const fetchedModels = await ollama.getModels(baseUrl);
        setOllamaModels(fetchedModels);
        setLoadingOllamaModels(false);
      }
    }
    check();
  }, [baseUrl]);

  // Effect - Load Mistral, if key exists
  useEffect(() => {
    const savedKey = getSetting("mistral_api_key");
    if (savedKey) {
      setMistralApiKeyLocal(savedKey);
      loadMistralModels(savedKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler - Load Mistral Models
  async function loadMistralModels(key: string) {
    setLoadingMistralModels(true);
    const models = await mistral.getModels(key);
    setMistralModels(models);
    setLoadingMistralModels(false);
  }

  // Callback - Handle Provider Change
  const handleProviderChange = useCallback(
    async (provider: "ollama" | "mistral") => {
      await setSetting("ai_provider", provider);
    },
    [setSetting],
  );

  // Callback - Handle Ollama Model Change
  const handleOllamaModelChange = useCallback(
    async (model: string) => {
      await setSetting("ollama_model", model);
      setOllamaSaved(true);
      setTimeout(() => setOllamaSaved(false), 1500);
    },
    [setSetting],
  );

  // Callback - Handle Base URL Change
  const handleBaseUrlChange = useCallback(
    async (url: string) => {
      await setSetting("ollama_base_url", url);
    },
    [setSetting],
  );

  // Callback - Handle Mistral API Key Verification
  const handleVerifyMistralKey = useCallback(async () => {
    if (!mistralApiKey.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    const result = await mistral.verifyApiKey(mistralApiKey.trim());
    setVerifyResult(result);
    setVerifying(false);
    if (result.valid) {
      await setSetting("mistral_api_key", mistralApiKey.trim());
      await loadMistralModels(mistralApiKey.trim());
    }
  }, [mistralApiKey, setSetting]);

  // Callback - Handle Mistral Model Change
  const handleMistralModelChange = useCallback(
    async (model: string) => {
      await setSetting("mistral_model", model);
      setMistralSaved(true);
      setTimeout(() => setMistralSaved(false), 1500);
    },
    [setSetting],
  );

  // Callback - Toggle Autocomplete
  const handleToggleAutocomplete = useCallback(async () => {
    await setSetting(
      "autocomplete_enabled",
      autocompleteEnabled ? "false" : "true",
    );
  }, [autocompleteEnabled, setSetting]);

  // Callback - Handle Autocomplete Delay Change
  const handleDelayChange = useCallback(
    async (delay: string) => {
      await setSetting("autocomplete_delay", delay);
    },
    [setSetting],
  );

  return (
    <div>
      <SettingSectionHeader
        title="AI"
        description="Configure AI provider and settings"
      />

      {/* PROVIDER SELECTOR */}
      <SettingRow
        label="Provider"
        description="Choose between local or cloud AI"
      >
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            onClick={() => handleProviderChange("ollama")}
            className={clsx(
              "rounded-md px-3 py-1 text-sm transition-colors duration-[80ms]",
              aiProvider === "ollama"
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text",
            )}
          >
            Ollama (Local)
          </button>
          <button
            onClick={() => handleProviderChange("mistral")}
            className={clsx(
              "rounded-md px-3 py-1 text-sm transition-colors duration-[80ms]",
              aiProvider === "mistral"
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text",
            )}
          >
            Mistral (Cloud)
          </button>
        </div>
      </SettingRow>

      {/* OLLAMA SETTINGS */}
      {aiProvider === "ollama" && (
        <>
          <SettingRow
            label="Ollama status"
            description="Connection to local Ollama instance"
          >
            <span
              className={clsx(
                "flex items-center gap-1.5 text-sm",
                ollamaStatus === true
                  ? "text-green-400"
                  : ollamaStatus === false
                    ? "text-red-400"
                    : "text-text-faint",
              )}
            >
              <span
                className={clsx(
                  "inline-block h-2 w-2 rounded-full",
                  ollamaStatus === true
                    ? "bg-green-400"
                    : ollamaStatus === false
                      ? "bg-red-400"
                      : "bg-text-faint",
                )}
              />
              {ollamaStatus === true
                ? "Connected"
                : ollamaStatus === false
                  ? "Offline"
                  : "Checking..."}
            </span>
          </SettingRow>

          <SettingRow label="Base URL" description="Ollama API endpoint">
            <input
              value={baseUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleBaseUrlChange(e.target.value)
              }
              className="w-56 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none focus:border-accent font-mono"
            />
          </SettingRow>

          <SettingRow
            label="Default model"
            description="Model used for AI features"
          >
            <div className="flex items-center gap-2">
              {loadingOllamaModels ? (
                <Loader2 size={14} className="animate-spin text-text-faint" />
              ) : ollamaModels.length > 0 ? (
                <select
                  value={currentOllamaModel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleOllamaModelChange(e.target.value)
                  }
                  className="w-48 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
                >
                  <option value="">Select a model</option>
                  {ollamaModels.map((m: string) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-text-faint">
                  {ollamaStatus === false
                    ? "Start Ollama first"
                    : "No models found"}
                </span>
              )}
              {ollamaSaved && <Check size={14} className="text-green-400" />}
            </div>
          </SettingRow>
        </>
      )}

      {/* MISTRAL SETTINGS */}
      {aiProvider === "mistral" && (
        <>
          <SettingRow label="API Key" description="Your Mistral API key">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={mistralApiKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setMistralApiKeyLocal(e.target.value);
                      setVerifyResult(null);
                    }}
                    placeholder="Enter API key..."
                    className="w-52 rounded-md border border-border bg-surface px-3 py-1.5 pr-8 text-sm text-text outline-none focus:border-accent font-mono"
                  />
                  <button
                    onClick={() => setShowApiKey((v: boolean) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted"
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  onClick={handleVerifyMistralKey}
                  disabled={verifying || !mistralApiKey.trim()}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text disabled:opacity-50"
                >
                  {verifying ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
              {verifyResult && (
                <span
                  className={clsx(
                    "flex items-center gap-1 text-xs",
                    verifyResult.valid ? "text-green-400" : "text-red-400",
                  )}
                >
                  {verifyResult.valid ? (
                    <>
                      <Check size={12} /> Key verified
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} /> {verifyResult.error}
                    </>
                  )}
                </span>
              )}
            </div>
          </SettingRow>

          <SettingRow
            label="Default model"
            description="Mistral model for AI features"
          >
            <div className="flex items-center gap-2">
              {loadingMistralModels ? (
                <Loader2 size={14} className="animate-spin text-text-faint" />
              ) : mistralModels.length > 0 ? (
                <select
                  value={currentMistralModel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleMistralModelChange(e.target.value)
                  }
                  className="w-48 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
                >
                  <option value="">Select a model</option>
                  {mistralModels.map((m: string) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-text-faint">
                  Verify API key to load models
                </span>
              )}
              {mistralSaved && <Check size={14} className="text-green-400" />}
            </div>
          </SettingRow>
        </>
      )}

      {/* AUTOCOMPLETE SETTINGS */}
      <SettingRow
        label="Autocomplete"
        description="Show AI writing suggestions while typing"
      >
        <button
          onClick={handleToggleAutocomplete}
          className={`relative h-6 w-11 cursor-pointer overflow-hidden rounded-full transition-colors duration-[80ms] ${
            autocompleteEnabled ? "bg-accent" : "bg-surface-2"
          }`}
        >
          <span
            className={clsx(
              "absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-[80ms]",
              autocompleteEnabled ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </SettingRow>

      {autocompleteEnabled && (
        <SettingRow
          label="Autocomplete delay"
          description="Time to wait before showing suggestions"
        >
          <select
            value={autocompleteDelay}
            onChange={(e) => handleDelayChange(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
          >
            <option value="500">500ms</option>
            <option value="1000">1 second</option>
            <option value="2000">2 seconds</option>
          </select>
        </SettingRow>
      )}
    </div>
  );
};

export default AISettings;
