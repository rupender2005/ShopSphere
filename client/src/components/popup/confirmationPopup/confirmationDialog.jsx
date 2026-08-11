import { useState, useEffect } from "react";
import Popup from "../backdroppopup/popup";
import CommonField from "../../inputs/commonField/commonField";
import styles from "./confirmation.module.css";

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  matchText = "Confirm",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatched = inputValue === matchText;

  return (
    <Popup placement="center" maxWidth="400px">
      <div
        className={`radius-16 p-6 flex flex-col gap-4 bg-white ${styles.container}`}
      >
        <h3 className="m-0 text-18 fw-700 text-black">{title}</h3>

        <p className="m-0 text-14 fw-500 text-grayy">{message}</p>

        <div className="mt-1">
          <p className="mb-1 text-14 fw-600 text-grayy">
            Type <strong className="text-black">{matchText}</strong> to proceed:
          </p>
          <CommonField
            type="text"
            placeholder={matchText}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
        </div>

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
            disabled={isLoading || !isMatched}
          >
            {isLoading ? "Loading..." : confirmText}
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default ConfirmationDialog;
