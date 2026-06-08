"use client";

import { useCallback, useEffect, useRef, useState, createContext, useContext } from "react";
import { CheckCircle, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remover = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const adicionar = useCallback(
    (msg, tipo = "sucesso") => {
      const id = Date.now();
      setToasts((t) => [...t, { id, msg, tipo }]);
      timers.current[id] = setTimeout(() => remover(id), 4500);
    },
    [remover]
  );

  return (
    <ToastContext.Provider value={{ adicionar }}>
      {children}
      <div className="toasts-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.tipo}`}>
            {t.tipo === "sucesso" ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <span>{t.msg}</span>
            <button className="toast-fechar" onClick={() => remover(t.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}

export function Dialog({ titulo, onFechar, children, largo = false }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onFechar();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onFechar]);

  return (
    <div className="dialog-overlay" onClick={onFechar}>
      <div
        className="dialog-panel"
        style={largo ? { maxWidth: 820 } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-cabecalho">
          <h3>{titulo}</h3>
          <button className="dialog-fechar" onClick={onFechar}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
