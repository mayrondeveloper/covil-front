import { useCallback } from "react";
import { toast } from "react-toastify";

export interface UndoableOptions {
  message: string;
  /** Executado se o usuário NÃO clicar em "Desfazer" dentro do timeout. */
  onCommit: () => void | Promise<void>;
  /** Executado se o usuário clicar em "Desfazer". */
  onUndo?: () => void;
  timeoutMs?: number;
  undoLabel?: string;
}

/**
 * Mostra um toast com botão "Desfazer". Se o usuário não clicar em N ms,
 * `onCommit` é chamado. Se clicar, `onUndo` é chamado e `onCommit` é cancelado.
 *
 * Padrão de uso (delete otimista):
 *   1. Remove a linha do estado local imediatamente
 *   2. run({ onCommit: deleteAPI, onUndo: () => restaurar estado })
 */
export const useUndoable = () => {
  const run = useCallback((opts: UndoableOptions) => {
    const { message, onCommit, onUndo, timeoutMs = 5000, undoLabel = "Desfazer" } = opts;
    let canceled = false;

    const handleUndo = () => {
      if (canceled) return;
      canceled = true;
      try {
        onUndo?.();
      } catch {
        // noop
      }
    };

    const id = toast(
      ({ closeToast }: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ flex: 1 }}>{message}</span>
          <button
            type="button"
            onClick={() => {
              handleUndo();
              closeToast?.();
            }}
            style={{
              background: "transparent",
              color: "#FCD9A6",
              fontWeight: 600,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {undoLabel}
          </button>
        </div>
      ),
      {
        autoClose: timeoutMs,
        closeButton: false,
        type: "default",
        theme: "dark",
        hideProgressBar: false,
      }
    );

    setTimeout(() => {
      if (!canceled) {
        Promise.resolve(onCommit()).catch(() => {
          handleUndo();
        });
      }
      toast.dismiss(id);
    }, timeoutMs);
  }, []);

  return { run };
};

export default useUndoable;
