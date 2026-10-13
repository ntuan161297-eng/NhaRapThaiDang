// apps/web/src/services/notification.tsx
import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

// Event-driven state manager
type ToastListener = (toasts: ToastItem[]) => void;
type ConfirmListener = (dialog: ConfirmDialogOptions | null) => void;

let activeToasts: ToastItem[] = [];
let toastListeners: ToastListener[] = [];

let activeConfirmDialog: ConfirmDialogOptions | null = null;
let confirmListeners: ConfirmListener[] = [];

export const toast = {
  success: (message: string, duration = 3500) => {
    addToast('success', message, duration);
  },
  error: (message: string, duration = 4000) => {
    addToast('error', message, duration);
  },
  info: (message: string, duration = 3500) => {
    addToast('info', message, duration);
  },
  warning: (message: string, duration = 3500) => {
    addToast('warning', message, duration);
  },
  dismiss: (id: string) => {
    removeToast(id);
  }
};

function addToast(type: ToastItem['type'], message: string, duration: number) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastItem = { id, type, message, duration };
  activeToasts = [...activeToasts, newToast];
  toastListeners.forEach(l => l(activeToasts));

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

function removeToast(id: string) {
  activeToasts = activeToasts.filter(t => t.id !== id);
  toastListeners.forEach(l => l(activeToasts));
}

export function showConfirm(options: ConfirmDialogOptions) {
  activeConfirmDialog = options;
  confirmListeners.forEach(l => l(activeConfirmDialog));
}

export function closeConfirm() {
  activeConfirmDialog = null;
  confirmListeners.forEach(l => l(null));
}

/**
 * Toast Container component hiển thị thông báo đúng chuẩn giao diện
 * - Bo góc, nền trắng, bóng đổ mềm mại
 * - Icon tròn xanh lá checkmark bên trái (chuẩn theo mẫu)
 * - Nút X đóng nhanh bên phải
 */
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>(activeToasts);

  useEffect(() => {
    const listener: ToastListener = (updated) => setToasts([...updated]);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-200/90 py-3 px-4 flex items-center justify-between gap-3 animate-fade-in transition-all transform hover:scale-[1.02]"
          style={{ minWidth: '260px' }}
        >
          {/* Cụm Icon và Nội dung */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {t.type === 'success' && (
              <div className="w-5 h-5 rounded-full bg-[#00a82d] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            {t.type === 'error' && (
              <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
            {t.type === 'warning' && (
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            )}
            {t.type === 'info' && (
              <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Info className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            )}

            <div className="text-stone-700 text-sm font-medium leading-snug break-words">
              {t.message}
            </div>
          </div>

          {/* Nút đóng X màu xám nhạt như mẫu */}
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-md transition-colors shrink-0 cursor-pointer"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * Modal Popup Xác Nhận (Confirm Popup Modal)
 * Thay thế hoàn toàn cho window.confirm / alert thô sơ của trình duyệt
 */
export const ConfirmModal: React.FC = () => {
  const [dialog, setDialog] = useState<ConfirmDialogOptions | null>(activeConfirmDialog);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const listener: ConfirmListener = (d) => setDialog(d ? { ...d } : null);
    confirmListeners.push(listener);
    return () => {
      confirmListeners = confirmListeners.filter(l => l !== listener);
    };
  }, []);

  if (!dialog) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await dialog.onConfirm();
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  const handleCancel = () => {
    if (dialog.onCancel) {
      dialog.onCancel();
    }
    closeConfirm();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 p-6 sm:p-7 relative space-y-5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cụm Header & Icon */}
        <div className="flex items-start gap-4 pt-1">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            dialog.isDanger 
              ? 'bg-rose-50 text-rose-600 border border-rose-200' 
              : 'bg-emerald-50 text-[#0e4b44] border border-emerald-200'
          }`}>
            {dialog.isDanger ? (
              <AlertCircle className="w-6 h-6 stroke-[2]" />
            ) : (
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            )}
          </div>

          <div className="space-y-1.5 flex-1 pr-6">
            <h3 className="text-lg font-bold text-stone-900 leading-snug">
              {dialog.title || (dialog.isDanger ? 'Xác nhận xóa dữ liệu' : 'Xác nhận thực hiện')}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line font-normal">
              {dialog.message}
            </p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <button
            type="button"
            disabled={loading}
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {dialog.cancelText || 'Hủy bỏ'}
          </button>
          
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              dialog.isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-[#0e4b44] hover:bg-[#155e55] shadow-emerald-950/20'
            }`}
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{dialog.confirmText || (dialog.isDanger ? 'Đồng ý xóa' : 'Xác nhận')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
