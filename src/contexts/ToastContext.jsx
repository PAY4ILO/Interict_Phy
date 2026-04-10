 
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                                padding: '12px 20px',
                                background: toast.type === 'error' ? 'var(--bg-secondary)' : toast.type === 'success' ? '#10b981' : '#3b82f6',
                                color: toast.type === 'error' ? '#ef4444' : 'white',
                                borderRadius: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                                border: toast.type === 'error' ? '1px solid #ef4444' : 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem'
                            }}
                        >
                            {toast.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
