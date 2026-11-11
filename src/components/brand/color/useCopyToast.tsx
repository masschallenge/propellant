import * as React from 'react';
import { Toast } from '@masschallenge/propellant-web';

const TOAST_DURATION = 2600;

interface ToastMessage {
  id: number;
  title: string;
  isError: boolean;
}

const writeToClipboard = async (value: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch (error) {
    return false;
  }
};

export const useCopyToast = () => {
  const [message, setMessage] = React.useState<ToastMessage | null>(null);

  React.useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), TOAST_DURATION);
    return () => window.clearTimeout(timer);
  }, [message]);

  const copy = React.useCallback(async (value: string, shown: string = value) => {
    const isCopied = await writeToClipboard(value);
    setMessage({
      id: Date.now(),
      title: isCopied ? `Copied ${shown}` : `Could not copy ${shown}. Select it and copy by hand.`,
      isError: !isCopied,
    });
  }, []);

  const toast = (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
    >
      {message ? (
        <Toast
          key={message.id}
          title={message.title}
          tone={message.isError ? 'error' : 'success'}
          announce={false}
          className="pointer-events-auto w-auto"
        />
      ) : null}
    </div>
  );

  return { copy, toast };
};
