import Popup from "../backdroppopup/popup";
import styles from "./confirmation.module.css";

const ConfirmationPopup = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <Popup placement="center" maxWidth="400px">
      <div className={`radius-16 p-6 flex flex-col gap-4 bg-white ${styles.container}`}>
        <h3 className="m-0 text-18 fw-700 text-black">{title}</h3>
        
        <p className="m-0 text-14 fw-500 text-grayy">
          {message}
        </p>

        <div className="flex gap-4 flex-end mt-2">
          <button
            className={`pointer radius-8 p-3 fw-600 text-14 ${styles.cancelBtn}`}
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`pointer radius-8 p-3 fw-600 text-14 text-white ${
              isDestructive ? styles.destructiveBtn : styles.confirmBtn
            }`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : confirmText}
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default ConfirmationPopup;
