"use client";

// REACT
import { useState, useCallback, useEffect, useMemo } from "react";

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

// HOOKS
import { useTheme } from "@/hooks/useTheme";

// LUCIDE
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Download,
  Terminal,
  Box,
} from "lucide-react";

// TYPES
import { OnboardingStep as OnboardingStepType } from "@/types/onboarding";
import { ThemeMode } from "@/types/theme";

// TYPESCRIPT
type Props = {
  onComplete: () => void;
};

const TOTAL_STEPS = 5;

const THEME_OPTIONS: {
  mode: ThemeMode;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    mode: "dark",
    label: "Dark",
    icon: <Moon size={24} />,
    description: "Easy on the eyes",
  },
  {
    mode: "light",
    label: "Light",
    icon: <Sun size={24} />,
    description: "Clean and bright",
  },
  {
    mode: "system",
    label: "System",
    icon: <Monitor size={24} />,
    description: "Match your OS",
  },
];

const Onboarding = ({ onComplete }: Props) => {
  // States
  const [step, setStep] = useState<OnboardingStepType>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [workspaceName, setWorkspaceName] = useState<string>("My Workspace");
  const [workspaceIcon, setWorkspaceIcon] = useState<string>("🏠");
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [finishing, setFinishing] = useState<boolean>(false);
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [pendingIconFile, setPendingIconFile] = useState<string | null>(null);
  const [iconPreviewSrc, setIconPreviewSrc] = useState<string | null>(null);

  // Hooks
  const { theme, setTheme } = useTheme();

  // Effect - Ollama Check on Step 4
  useEffect(() => {
    if (step !== 4) return;
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

  // Navigation
  const goForward = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS) as OnboardingStepType);
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1) as OnboardingStepType);
  }, []);

  // Validation
  const canContinue = useMemo(() => {
    if (step === 3) return workspaceName.trim().length > 0;
    return true;
  }, [step, workspaceName]);

  // Callback - Handle Icon Upload (during onboarding, before workspace exists)
  const handleUploadImage = useCallback(async (filePath: string) => {
    try {
      const { convertFileSrc } = await import("@tauri-apps/api/core");
      setPendingIconFile(filePath);
      setIconPreviewSrc(convertFileSrc(filePath));
      setWorkspaceIcon("__pending_image__");
      setShowIconPicker(false);
    } catch {
      // Tauri not available
    }
  }, []);

  // Callback - Finish Onboarding
  const handleFinish = useCallback(async () => {
    setFinishing(true);
    try {
      // Use a placeholder icon if a custom image is pending
      const initialIcon = pendingIconFile ? "🏠" : workspaceIcon;
      const workspace = await db.createWorkspace(workspaceName, initialIcon);

      // If user uploaded a custom image, save it now that workspace exists
      if (pendingIconFile) {
        await db.saveWorkspaceIcon(workspace.id, pendingIconFile);
      }

      await db.setSetting("active_workspace_id", workspace.id);

      if (selectedModel) {
        await db.setSetting("ollama_model", selectedModel);
      }

      const gettingStarted = await db.createPage({
        workspaceId: workspace.id,
        title: "Getting Started",
        isDatabase: false,
      });

      const gettingStartedContent = JSON.stringify(ONBOARDING_CONTENT);
      await db.savePageContent(gettingStarted.id, gettingStartedContent);

      await db.setSetting("onboarding_complete", "true");

      onComplete();
    } catch (e) {
      console.error("Onboarding failed:", e);
      setFinishing(false);
    }
  }, [
    workspaceName,
    workspaceIcon,
    pendingIconFile,
    selectedModel,
    onComplete,
  ]);

  // Button label per step
  const continueLabel = useMemo(() => {
    if (step === 1) return "Get Started";
    if (step === 5) return finishing ? "Setting up..." : "Enter Seekbase";
    return "Continue";
  }, [step, finishing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
      {/* CARD */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* PROGRESS BAR */}
        <div className="h-[3px] w-full bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={false}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* STEP CONTENT */}
        <div className="min-h-[420px] px-10 py-10 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {/* STEP 1 — WELCOME */}
            {step === 1 && (
              <OnboardingStep key="step1" direction={direction}>
                <div className="flex flex-col items-center justify-center text-center pt-12">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="font-display text-5xl font-bold text-text"
                  >
                    Seekbase
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-4 text-lg text-text-muted"
                  >
                    Your local, AI-native knowledge base.
                  </motion.p>
                </div>
              </OnboardingStep>
            )}

            {/* STEP 2 — THEME */}
            {step === 2 && (
              <OnboardingStep key="step2" direction={direction}>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-text">
                    Choose your look
                  </h2>
                  <p className="mt-2 text-sm text-text-muted">
                    You can change this anytime in settings.
                  </p>

                  <div className="mt-8 flex justify-center gap-4">
                    {THEME_OPTIONS.map((opt) => (
                      <button
                        key={opt.mode}
                        onClick={() => setTheme(opt.mode)}
                        className={clsx(
                          "flex w-36 flex-col items-center gap-3 rounded-xl border-2 px-4 py-6 transition-all duration-150",
                          theme === opt.mode
                            ? "border-accent bg-accent/10 text-text"
                            : "border-border text-text-muted hover:border-text-faint hover:bg-surface-2",
                        )}
                      >
                        <div
                          className={clsx(
                            "flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-150",
                            theme === opt.mode
                              ? "bg-accent/20 text-accent"
                              : "bg-surface-2 text-text-muted",
                          )}
                        >
                          {opt.icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">
                            {opt.label}
                          </div>
                          <div className="mt-0.5 text-xs text-text-muted">
                            {opt.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </OnboardingStep>
            )}

            {/* STEP 3 — WORKSPACE */}
            {step === 3 && (
              <OnboardingStep key="step3" direction={direction}>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-text">
                    Name your workspace
                  </h2>
                  <p className="mt-2 text-sm text-text-muted">
                    You can always change this later.
                  </p>

                  {/* ICON */}
                  <div className="relative mt-6 flex justify-center">
                    <button
                      onClick={() => setShowIconPicker((v) => !v)}
                      className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-2 transition-colors duration-[80ms] hover:bg-surface-2/80 hover:ring-1 hover:ring-accent/40"
                      title="Change icon"
                    >
                      {iconPreviewSrc ? (
                        <img
                          src={iconPreviewSrc}
                          alt="Workspace icon"
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <WorkspaceIcon icon={workspaceIcon} size={32} />
                      )}
                    </button>

                    {/* ICON PICKER POPOVER */}
                    {showIconPicker && (
                      <div className="absolute top-full z-20 mt-2 rounded-lg border border-border bg-surface shadow-xl">
                        <IconPicker
                          currentIcon={workspaceIcon}
                          onSelectIcon={(icon) => {
                            setWorkspaceIcon(icon);
                            setPendingIconFile(null);
                            setIconPreviewSrc(null);
                            setShowIconPicker(false);
                          }}
                          onUploadImage={handleUploadImage}
                        />
                      </div>
                    )}
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
                      className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-center text-lg text-text outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </OnboardingStep>
            )}

            {/* STEP 4 — AI SETUP */}
            {step === 4 && (
              <OnboardingStep key="step4" direction={direction}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-2xl font-bold text-text">
                      Connect any on-device LLM
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">
                    Seekbase uses Ollama for private, on-device AI.
                  </p>

                  <div className="mt-6">
                    {ollamaAvailable === null ? (
                      <div className="flex items-center justify-center gap-2 py-12 text-sm text-text-muted">
                        <Loader2 size={16} className="animate-spin" />
                        Looking for Ollama...
                      </div>
                    ) : ollamaAvailable ? (
                      <div className="text-left">
                        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
                          <Check size={16} />
                          Ollama is running
                        </div>

                        {models.length > 0 && (
                          <div className="mt-4">
                            <label className="mb-2 block text-left text-xs font-medium text-text-muted">
                              Select a model
                            </label>
                            <div className="space-y-1.5">
                              {models.map((model: string, index: number) => (
                                <button
                                  key={index}
                                  onClick={() => setSelectedModel(model)}
                                  className={clsx(
                                    "flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-150",
                                    selectedModel === model
                                      ? "bg-accent/10 text-text ring-1 ring-accent"
                                      : "text-text-muted hover:bg-surface-2 hover:text-text",
                                  )}
                                >
                                  <Sparkles size={14} />
                                  {model}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-4 rounded-xl border border-border bg-bg p-4 text-left">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                            <Download size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text">
                              Install Ollama
                            </p>
                            <p className="mt-0.5 text-xs text-text-muted">
                              Download from{" "}
                              <span className="text-accent">ollama.com</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-xl border border-border bg-bg p-4 text-left">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                            <Terminal size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text">
                              Start Ollama
                            </p>
                            <code className="mt-1 inline-block rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-text-muted">
                              ollama serve
                            </code>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 rounded-xl border border-border bg-bg p-4 text-left">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                            <Box size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text">
                              Pull a model
                            </p>
                            <code className="mt-1 inline-block rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-text-muted">
                              ollama pull llama3.2
                            </code>
                          </div>
                        </div>

                        <p className="pt-1 text-xs text-text-faint">
                          AI is optional — you can set this up later in
                          settings.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </OnboardingStep>
            )}

            {/* STEP 5 — COMPLETION */}
            {step === 5 && (
              <OnboardingStep key="step5" direction={direction}>
                <div className="flex flex-col items-center justify-center text-center pt-8">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.1,
                    }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10"
                  >
                    <Check size={40} className="text-green-400" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mt-6 text-2xl font-bold text-text"
                  >
                    You're all set!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                    className="mt-2 text-sm text-text-muted"
                  >
                    Your workspace is ready. Start building your knowledge base.
                  </motion.p>
                </div>
              </OnboardingStep>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM NAV */}
        <div className="flex items-center justify-between border-t border-border px-10 py-5">
          {/* BACK */}
          {step > 1 && step < 5 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          ) : (
            <div />
          )}

          {/* CONTINUE / FINISH */}
          <button
            onClick={step === 5 ? handleFinish : goForward}
            disabled={(step === 5 && finishing) || !canContinue}
            className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-[80ms] hover:bg-accent-light disabled:opacity-50"
          >
            {step === 5 && finishing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                {continueLabel}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
