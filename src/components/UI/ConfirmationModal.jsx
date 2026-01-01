import { createPortal } from 'react-dom';
import { AlertCircle, X, Check } from 'lucide-react';
import '../Modal.css';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger' // 'danger' or 'primary'
}) {
    if (!isOpen) return null;

    const modalContent = (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
            <div className="modal-content glass animate-fade-in" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="flex items-center gap-3">
                        <AlertCircle className={type === 'danger' ? 'text-danger' : 'text-primary'} size={24} />
                        <h3 className="m-0">{title}</h3>
                    </div>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </header>

                <div className="modal-body" style={{ whiteSpace: 'pre-wrap' }}>
                    <p className="description" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                        {message}
                    </p>
                </div>

                <footer className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn-primary ${type === 'danger' ? 'btn-danger' : ''}`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {type === 'danger' ? <X size={18} /> : <Check size={18} />}
                        <span>{confirmText}</span>
                    </button>
                </footer>
            </div>
        </div>
    );

    return createPortal(modalContent, document.getElementById('modal-root'));
}
