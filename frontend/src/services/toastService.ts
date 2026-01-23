type ToastType = 'error' | 'success' | 'warning' | 'info';

type ToastHandler = (message: string, type: ToastType) => void;

let toastHandler: ToastHandler | null = null;

export const toastService = {
  setHandler(handler: ToastHandler) {
    toastHandler = handler;
  },

  show(message: string, type: ToastType) {
    if (toastHandler) {
      toastHandler(message, type);
    }
  },

  error(message: string) {
    this.show(message, 'error');
  },

  success(message: string) {
    this.show(message, 'success');
  },

  warning(message: string) {
    this.show(message, 'warning');
  },

  info(message: string) {
    this.show(message, 'info');
  },
};
