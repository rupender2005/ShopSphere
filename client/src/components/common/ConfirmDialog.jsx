const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <h2 id="confirm-title">{title}</h2>
      {message && <p>{message}</p>}
      <button type="button" onClick={onCancel}>{cancelText}</button>
      <button type="button" onClick={onConfirm}>{confirmText}</button>
    </div>
  );
};

export default ConfirmDialog;
