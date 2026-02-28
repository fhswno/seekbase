"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  workspaceName: string;
  onConfirm: () => void;
  onClose: () => void;
};

const DeleteWorkspaceModal = ({
  open,
  workspaceName,
  onConfirm,
  onClose,
}: Props) => {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const canDelete = confirmText === workspaceName;

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setConfirmText("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleConfirm = () => {
    if (!canDelete) return;
    onConfirm();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />

          {/* MODAL — use flexbox centering to avoid transform conflict with framer-motion */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl"
          >
            {/* WARNING ICON */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-text">
                Delete workspace
              </h2>
            </div>

            {/* WARNING TEXT */}
            <p className="mb-4 text-sm text-text-muted">
              This will permanently delete{" "}
              <span className="font-semibold text-text">{workspaceName}</span>{" "}
              and all its pages, databases, and content. This action cannot be
              undone.
            </p>

            {/* CONFIRM INPUT */}
            <div className="mb-5">
              <label className="mb-1.5 block text-sm text-text-muted">
                Type{" "}
                <span className="font-semibold text-text">{workspaceName}</span>{" "}
                to confirm
              </label>
              <input
                ref={inputRef}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm();
                  if (e.key === "Escape") onClose();
                }}
                placeholder={workspaceName}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-red-500/50"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-[80ms] hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete workspace
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteWorkspaceModal;
