type ToastType = 'error' | 'success' | 'warning' | 'info';

interface ToastOptions {
  duration?: number; // Duration in milliseconds
}

interface QueuedToast {
  message: string;
  type: ToastType;
  options?: ToastOptions;
}

type ToastHandler = (message: string, type: ToastType, options?: ToastOptions) => void;

let toastHandler: ToastHandler | null = null;
let queuedToasts: QueuedToast[] = [];

export const toastService = {
  setHandler(handler: ToastHandler) {
    toastHandler = handler;
    // Process any queued toasts
    if (queuedToasts.length > 0) {
      queuedToasts.forEach(({ message, type, options }) => {
        handler(message, type, options);
      });
      queuedToasts = [];
    }
  },

  show(message: string, type: ToastType, options?: ToastOptions) {
    if (toastHandler) {
      toastHandler(message, type, options);
    } else {
      // Queue the toast until handler is ready
      queuedToasts.push({ message, type, options });
    }
  },

  error(message: string, options?: ToastOptions) {
    this.show(message, 'error', options);
  },

  success(message: string, options?: ToastOptions) {
    this.show(message, 'success', options);
  },

  warning(message: string, options?: ToastOptions) {
    this.show(message, 'warning', options);
  },

  info(message: string, options?: ToastOptions) {
    this.show(message, 'info', options);
  },
};
