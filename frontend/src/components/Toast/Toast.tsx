import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toastService } from '../../services/toastService';

interface ToastOptions {
  duration?: number;
}

interface ToastMessage {
  id: number;
  message: string;
  severity: AlertColor;
  duration?: number;
}

interface ToastContextType {
  showError: (message: string, options?: ToastOptions) => void;
  showSuccess: (message: string, options?: ToastOptions) => void;
  showWarning: (message: string, options?: ToastOptions) => void;
  showInfo: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

// Parse message for links in format [text](/path)
const parseMessageWithLinks = (message: string, onNavigate: (path: string) => void) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(message)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(message.slice(lastIndex, match.index));
    }
    // Add the link
    const linkText = match[1];
    const linkPath = match[2];
    parts.push(
      <Link
        key={match.index}
        component="button"
        onClick={() => onNavigate(linkPath)}
        sx={{
          color: 'inherit',
          textDecoration: 'underline',
          fontWeight: 600,
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
        }}
      >
        {linkText}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < message.length) {
    parts.push(message.slice(lastIndex));
  }

  return parts.length > 0 ? parts : message;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const navigate = useNavigate();

  const showToast = useCallback((message: string, severity: AlertColor, options?: ToastOptions) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, severity, duration: options?.duration }]);
  }, []);

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showError = useCallback((message: string, options?: ToastOptions) => showToast(message, 'error', options), [showToast]);
  const showSuccess = useCallback((message: string, options?: ToastOptions) => showToast(message, 'success', options), [showToast]);
  const showWarning = useCallback((message: string, options?: ToastOptions) => showToast(message, 'warning', options), [showToast]);
  const showInfo = useCallback((message: string, options?: ToastOptions) => showToast(message, 'info', options), [showToast]);

  // Register with toastService for global access (axios interceptors, etc.)
  useEffect(() => {
    toastService.setHandler((message, type, options) => {
      showToast(message, type, options);
    });
  }, [showToast]);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <ToastContext.Provider value={{ showError, showSuccess, showWarning, showInfo }}>
      {children}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={toast.duration ?? 6000}
          onClose={() => hideToast(toast.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            bottom: `${24 + index * 60}px !important`,
          }}
        >
          <Alert
            onClose={() => hideToast(toast.id)}
            severity={toast.severity}
            variant="filled"
            sx={{ width: '100%', minWidth: 300 }}
          >
            {parseMessageWithLinks(toast.message, handleNavigate)}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
