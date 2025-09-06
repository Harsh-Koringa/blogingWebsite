import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Toast({ message, onClose, type = 'info' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`
                fixed bottom-4 right-4 flex items-center gap-2 
                rounded-lg border px-4 py-3 shadow-lg
                ${type === 'success' ? 'border-green-500/20 bg-green-500/10 text-green-500' : ''}
                ${type === 'error' ? 'border-red-500/20 bg-red-500/10 text-red-500' : ''}
                ${type === 'info' ? 'border-blue-500/20 bg-blue-500/10 text-blue-500' : ''}
            `}
        >
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={onClose}
                className="ml-2 rounded-full p-1 hover:bg-white/10"
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}

export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

export function useToast() {
    const [toasts, setToasts] = React.useState([]);

    const addToast = React.useCallback(({ message, type = 'info' }) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    }, []);

    const removeToast = React.useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
}
