"use client";

// REACT
import { useState, useCallback, useEffect } from "react";

// COMPONENTS
import IconPicker from "@/components/ui/IconPicker";
import WorkspaceIcon from "@/components/ui/WorkspaceIcon";
import OnboardingStep from "./onboarding/OnboardingStep";

// FRAMER MOTION
import { motion, AnimatePresence } from "framer-motion";

// CLSX
import clsx from "clsx";

// DB
import * as db from "@/lib/db";

// DATA
import { ONBOARDING_CONTENT } from "@/data/onboarding";

// OLLAMA
import * as ollama from "@/lib/ollama";

// LUCIDE
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";

// TYPES
import { OnboardingStep as OnboardingStepType } from "@/types/onboarding";

// TYPESCRIPT
type Props = {
  onComplete: () => void;
};

const Onboarding = ({ onComplete }: Props) => {
  // States
  const [step, setStep] = useState<OnboardingStepType>(1);
  const [workspaceName, setWorkspaceName] = useState<string>("My Workspace");
  const [workspaceIcon, setWorkspaceIcon] = useState<string>("🏠");
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [finishing, setFinishing] = useState<boolean>(false);

  // Effect - Ollama Check on Step 3
  useEffect(() => {
    if (step !== 3) return;
    async function check() {
      const available = await ollama.checkOllamaStatus();
      setOllamaAvailable(available);
      if (available) {
        const fetchedModels = await ollama.getModels();
        setModels(fetchedModels);
        if (fetchedModels.length > 0) {
          setSelectedModel(fetchedModels[0]);
        }
      }
    }
    check();
  }, [step]);

  // Callback - Finish Onboarding
  const handleFinish = useCallback(async () => {
    setFinishing(true);
    try {
      // Write everything to the database — do NOT touch Zustand stores here.
      // AppShell will re-run initialization and load from DB after onComplete().
      const workspace = await db.createWorkspace(workspaceName, workspaceIcon);
      await db.setSetting("active_workspace_id", workspace.id);

      if (selectedModel) {
        await db.setSetting("ollama_model", selectedModel);
      }

      // Create Getting Started page
      const gettingStarted = await db.createPage({
        workspaceId: workspace.id,
        title: "Getting Started",
        isDatabase: false,
      });

      const gettingStartedContent = JSON.stringify(ONBOARDING_CONTENT);
      await db.savePageContent(gettingStarted.id, gettingStartedContent);

      // Mark onboarding complete
      await db.setSetting("onboarding_complete", "true");

      // Signal AppShell — it will load everything from DB
      onComplete();
    } catch (e) {
      console.error("Onboarding failed:", e);
      setFinishing(false);
    }
  }, [workspaceName, workspaceIcon, selectedModel, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <OnboardingStep key="step1">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-display text-6xl font-bold text-text"
              >
                Seekbase
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-4 text-lg text-text-muted"
              >
                Your second brain. Fully yours.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                onClick={() => setStep(2)}
                className="mt-8 flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors duration-[80ms] hover:bg-accent-light mx-auto"
              >
                Get Started
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </OnboardingStep>
        )}

        {step === 2 && (
          <OnboardingStep key="step2">
            <div className="w-full max-w-sm">
              <h2 className="text-center text-2xl font-bold text-text">
                Name your workspace
              </h2>
              <p className="mt-2 text-center text-sm text-text-muted">
                You can always change this later.
              </p>

              {/* ICON PICKER */}
              <div className="mt-6 flex justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-lg bg-surface p-2">
                    <WorkspaceIcon icon={workspaceIcon} size={32} />
                  </div>
                  <div className="rounded-lg border border-border bg-surface">
                    <IconPicker
                      currentIcon={workspaceIcon}
                      onSelectIcon={(icon) => setWorkspaceIcon(icon)}
                    />
                  </div>
                </div>
              </div>

              {/* NAME INPUT */}
              <div className="mt-4">
                <input
                  value={workspaceName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setWorkspaceName(e.target.value)
                  }
                  placeholder="My Workspace"
                  autoFocus
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-center text-lg text-text outline-none focus:border-accent"
                />
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!workspaceName.trim()}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors duration-[80ms] hover:bg-accent-light disabled:opacity-50"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            </div>
          </OnboardingStep>
        )}

        {step === 3 && (
          <OnboardingStep key="step3">
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-center gap-2">
                <Sparkles size={24} className="text-ai" />
                <h2 className="text-2xl font-bold text-text">Connect AI</h2>
              </div>
              <p className="mt-2 text-center text-sm text-text-muted">
                Seekbase uses Ollama for on-device AI.
              </p>

              <div className="mt-6 rounded-lg border border-border bg-surface p-4">
                {ollamaAvailable === null ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-text-muted">
                    <Loader2 size={14} className="animate-spin" />
                    Checking for Ollama...
                  </div>
                ) : ollamaAvailable ? (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <Check size={14} />
                      Ollama is running
                    </div>

                    {models.length > 0 && (
                      <div className="mt-4">
                        <label className="text-xs font-medium text-text-muted">
                          Select a model
                        </label>
                        <div className="mt-1.5 space-y-1">
                          {models.map((model: string, index: number) => (
                            <button
                              key={index}
                              onClick={() => setSelectedModel(model)}
                              className={clsx(
                                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-[80ms]",
                                selectedModel === model
                                  ? "bg-accent/10 text-text ring-1 ring-accent"
                                  : "text-text-muted hover:bg-surface-2 hover:text-text",
                              )}
                            >
                              <Sparkles size={12} />
                              {model}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-text-muted">
                      Ollama is not running. To use AI features:
                    </p>
                    <ol className="mt-3 space-y-2 text-sm text-text-muted">
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 text-accent">1.</span>
                        <span>
                          Install from{" "}
                          <span className="text-accent-light">ollama.com</span>
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 text-accent">2.</span>
                        <span>
                          Run{" "}
                          <code className="rounded bg-bg px-1 py-0.5 font-mono text-xs">
                            ollama serve
                          </code>
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 text-accent">3.</span>
                        <span>
                          Pull a model:{" "}
                          <code className="rounded bg-bg px-1 py-0.5 font-mono text-xs">
                            ollama pull llama3.2
                          </code>
                        </span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                {!ollamaAvailable && (
                  <button
                    onClick={handleFinish}
                    disabled={finishing}
                    className="flex-1 rounded-lg border border-border px-4 py-3 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text disabled:opacity-50"
                  >
                    Skip for now
                  </button>
                )}
                <button
                  onClick={handleFinish}
                  disabled={finishing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-colors duration-[80ms] hover:bg-accent-light disabled:opacity-50"
                >
                  {finishing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      {ollamaAvailable ? "Finish setup" : "Get started"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* STEP INDICATORS */}
              <div className="mt-6 flex justify-center gap-1.5">
                {[1, 2, 3].map((s: number) => (
                  <div
                    key={s}
                    className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      s <= step ? "bg-accent" : "bg-surface-2",
                    )}
                  />
                ))}
              </div>
            </div>
          </OnboardingStep>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
