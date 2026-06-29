import { Button } from './button';
import { Modal } from './modal';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Renders the confirm button in the destructive (red) variant. */
  destructive?: boolean;
  /** Disables actions and shows the in-flight state on confirm. */
  loading?: boolean;
}

/**
 * Small confirmation dialog for destructive or irreversible actions (delete a
 * venue, remove a track, …). Centralizes the confirm/cancel pattern so every
 * call site reads the same and stays accessible (Esc + backdrop close via Modal).
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      width={420}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
