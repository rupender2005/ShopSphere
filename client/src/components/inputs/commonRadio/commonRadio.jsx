import Radio from "@mui/material/Radio";
import styles from "./commonRadio.module.css";

const CommonRadio = ({
  checked = false,
  onChange,
  label = "",
  disabled = false,
  value,
  name,
  size = "medium",
}) => {
  return (
    <label className={`flex alignCenter gap-1 ${styles.wrapper} ${disabled ? styles.disabled : ""}`}>
      <Radio
        checked={checked}
        onChange={onChange}
        value={value}
        name={name}
        disabled={disabled}
        size={size}
        className={styles.radio}
        sx={{
          color: "#cbd5e1",
          "&.Mui-checked": {
            color: "#4B21B5",
          },
          "&:hover": {
            backgroundColor: "rgba(75, 33, 181, .08)",
          },
        }}
      />
      {label && <span className={`text-14 fw-500 ${styles.label}`}>{label}</span>}
    </label>
  );
};

export default CommonRadio;
