import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4">
        {isDestructive && (
          <div className="shrink-0 w-10 h-10 rounded-full bg-[#FCEBEB] text-[#B94B4B] flex items-center justify-center border border-[#B94B4B]/30 shadow-subtle">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-[#292326] leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t border-[#EAE3DE]">
        <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto min-h-[44px]">
          {cancelText}
        </Button>
        <Button
          variant={isDestructive ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
          className="w-full sm:w-auto min-h-[44px]"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
