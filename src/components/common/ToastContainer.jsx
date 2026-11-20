import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border transition-all duration-300 animate-slide-in ${
              isSuccess
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
                : isError
                ? 'bg-rose-50/95 border-rose-200 text-rose-900'
                : 'bg-slate-900/95 border-slate-700 text-white'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isSuccess && <CheckCircle2 className="text-emerald-600" size={18} />}
              {isError && <AlertCircle className="text-rose-600" size={18} />}
              {isInfo && <Info className="text-cyan-400" size={18} />}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
