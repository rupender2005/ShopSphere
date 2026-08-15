import Checkbox from "@mui/material/Checkbox";

import styles from "./CommonCheckbox.module.css";

const CommonCheckbox = ({
  checked = false,
  onChange,
  label = "",
  disabled = false,
  indeterminate = false,
  size = "medium",
}) => {
  return (
    <label className={`flex alignCenter gap-1 ${styles.wrapper}`}>
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        onChange={onChange}
        disabled={disabled}
        size={size}
        className={styles.checkbox}
        sx={{
          color: "#cbd5e1",

          "&.Mui-checked, &.MuiCheckbox-indeterminate": {
            color: "#4B21B5",
          },

          "&:hover": {
            backgroundColor: "rgba(75, 33, 181, .08)",
          },
        }}
      />

      {label && <span className={`text-16 ${styles.label}`}>{label}</span>}
    </label>
  );
};

export default CommonCheckbox;
