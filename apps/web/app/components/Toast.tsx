"use client";

import { useState, useCallback, useEffect } from "react";

interface ToastState {
  message: string;
  variant: "success" | "error";
  id: number;
}

function Toast({ toast, onDone }: { toast: ToastState; onDone: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);
    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onDone]);

  const isSuccess = toast.variant === "success";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.25s ease, opacity 0.25s ease",
        pointerEvents: "none",
      }}
    >
      <div
        className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
          isSuccess
            ? "bg-green-950 border-green-600 text-green-300"
            : "bg-red-950 border-red-600 text-red-300"
        }`}
        style={{ minWidth: 240, maxWidth: 360 }}
      >
        {toast.message}
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, variant: "success" | "error") => {
    setToast({ message, variant, id: Date.now() });
  }, []);

  const handleDone = useCallback(() => setToast(null), []);

  const ToastComponent = toast ? (
    <Toast key={toast.id} toast={toast} onDone={handleDone} />
  ) : null;

  return { showToast, ToastComponent };
}
