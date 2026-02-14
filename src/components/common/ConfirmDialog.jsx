import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'Enter') {
            onConfirm();
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div className="bg-background-card border border-white/10 rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-scaleIn">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center">
                            <AlertTriangle className="text-danger" size={24} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                            {title || 'Confirm Action'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                        aria-label="Close dialog"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Message */}
                <p className="text-muted text-base mb-8 leading-relaxed">
                    {message || 'Are you sure you want to proceed with this action?'}
                </p>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all focus:ring-2 focus:ring-white/20 outline-none"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-3 rounded-xl bg-danger hover:bg-danger/90 text-white font-semibold transition-all shadow-lg hover:shadow-danger/20 focus:ring-2 focus:ring-danger/50 outline-none"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
