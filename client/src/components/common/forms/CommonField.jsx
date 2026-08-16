import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import styles from "./CommonField.module.css";

const CommonField = ({
  type = "input",
  multiple = false,
  label,
  placeholder = "",
  value,
  onChange,
  options = [],
  rows = 5,
  disabled = false,
  required = false,
  error = "",
  helperText,
  name,
  fullWidth = true,
  InputProps,
  InputLabelProps,
  loading = false,
  freeSolo = false,
}) => {
  // Select
  if (type === "select") {
    let selectedOption;
    if (multiple) {
      selectedOption = Array.isArray(value) ? options.filter((o) => value.includes(o.value)) : [];
    } else {
      selectedOption = options.find((item) => item.value === value) || null;
    }

    return (
      <div className={styles.fieldWrapper}>
        <Autocomplete
          multiple={multiple}
          options={options}
          value={freeSolo ? value : selectedOption}
          disabled={disabled}
          fullWidth={fullWidth}
          loading={loading}
          freeSolo={freeSolo}
          getOptionLabel={(option) => typeof option === "string" ? option : (option?.label || "")}
          isOptionEqualToValue={(option, val) => typeof val === "string" ? option.value === val : option.value === val.value}
          onInputChange={(event, newInputValue) => {
            if (freeSolo && event) {
              onChange?.({ target: { name, value: newInputValue } });
            }
          }}
          onChange={(_, newValue) => {
            if (!freeSolo) {
              onChange?.({
                target: {
                  name,
                  value: multiple ? newValue.map((v) => v.value) : (newValue?.value || ""),
                },
              });
            } else if (!multiple && newValue) {
              onChange?.({ target: { name, value: typeof newValue === "string" ? newValue : newValue.value } });
            }
          }}
          disablePortal={false}
          slotProps={{
            popper: {
              sx: { zIndex: 9999999 },
              placement: "bottom-start",
              modifiers: [
                {
                  name: "flip",
                  enabled: true,
                },
                {
                  name: "preventOverflow",
                  enabled: true,
                },
              ],
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              required={required}
              error={!!error}
              helperText={error || helperText}
              className={styles.materialField}
            />
          )}
        />
      </div>
    );
  }
  // Textarea
  if (type === "textarea") {
    return (
      <div className={styles.fieldWrapper}>
        <TextField
          multiline
          rows={rows}
          fullWidth={fullWidth}
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          inputprops={InputProps}
          slotProps={{ input: InputProps }}
          required={required}
          error={!!error}
          helperText={error || undefined}
          name={name}
          variant="outlined"
          sx={{
            "& .MuiInputBase-input": {
              resize: "none",
              padding: "0px 24px",
            },
            "& .MuiInputBase-root": {
              padding: "16px 0",
            },
          }}
          className={`${styles.materialField}`}
        />
      </div>
    );
  }

  // Input
  return (
    <div className={styles.fieldWrapper}>
      <TextField
        type={type}
        fullWidth={fullWidth}
        label={label}
        placeholder={placeholder}
        value={value}
        inputprops={InputProps}
        onChange={onChange}
        disabled={disabled}
        required={required}
        error={!!error}
        helperText={error || undefined}
        name={name}
        variant="outlined"
        slotProps={{
          input: InputProps,
          inputLabel:
            type === "date" || type === "time"
              ? { shrink: true, ...InputLabelProps }
              : InputLabelProps,
        }}
        className={styles.materialField}
      />
    </div>
  );
};

export default CommonField;
