import { Toast, type ToastTone } from '@masschallenge/propellant-web';
import { useCallback, useRef, useState } from 'react';

export interface StudioToast {
  id: number;
  title: string;
  body?: string;
  tone?: ToastTone;
}

export type ShowToast = (toast: Omit<StudioToast, 'id'>) => void;

const TOAST_MILLISECONDS = 7000;

export const useToasts = () => {
  const [toasts, setToasts] = useState<StudioToast[]>([]);
  const counter = useRef(0);
  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const showToast = useCallback<ShowToast>(
    (toast) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), TOAST_MILLISECONDS);
    },
    [dismissToast],
  );
  return { toasts, showToast, dismissToast };
};

interface ToastRegionProps {
  toasts: StudioToast[];
  onDismiss: (id: number) => void;
}

export const ToastRegion = ({ toasts, onDismiss }: ToastRegionProps) => (
  <div
    aria-live="polite"
    aria-atomic="false"
    className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 lg:items-end lg:px-6"
  >
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className="pointer-events-auto w-full max-w-[var(--toast-width)]"
        data-studio-toast
      >
        <Toast
          title={toast.title}
          tone={toast.tone ?? 'brand'}
          announce={false}
          onDismiss={() => onDismiss(toast.id)}
        >
          {toast.body}
        </Toast>
      </div>
    ))}
  </div>
);
