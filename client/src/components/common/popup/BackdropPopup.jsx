import { useEffect } from "react";

import styles from "./BackdropPopup.module.css";

const Popup = ({
  children,
  onClose = () => {},
  blur = true,
  padding = "24px",
  placement = "center",
  maxWidth,
  panelClassName = "",
  closeOnBackdropClick = true,
}) => {
  // Disable Body Scroll
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow || "auto";
    };
  }, []);

  // ESC Close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className={`
        flex
        ${styles.popupWrapper}
        ${placement === "left" ? styles.leftPlacement : placement === "right" ? styles.rightPlacement : styles.centerPlacement}
        ${blur ? styles.blur : ""}
      `}
      style={{ padding }}
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      {/* Popup */}
      <div
        className={`${styles.popup} ${placement === "left" ? styles.leftPanel : placement === "right" ? styles.rightPanel : ""} ${panelClassName}`}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Popup;
