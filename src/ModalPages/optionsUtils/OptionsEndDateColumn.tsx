import { TextField } from "@mui/material";
import { useEffect } from "react";
import { useThemeContext } from "../../contexts/ThemeContext";

function optionsEndDateColumn() {
  const { optionsEndDateColumn, setOptionsEndDateColumn, optionsLastActiveTextFieldId } = useThemeContext();

  const handleOptionsEndDateColumnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptionsEndDateColumn(String(event.target.value));
  };

  useEffect(() => {
    if (optionsLastActiveTextFieldId.current === "options-enddate-column") {
      document.getElementById("options-enddate-column")?.focus();
    }
    // console.log(optionsLastActiveTextFieldId.current);
  }, [[optionsEndDateColumn]]); 

  return (
    <TextField
      id="options-enddate-column"
      variant="standard"
      type="text"
      sx={{ width: "100%" }}
      label="Data przyjazdu (nazwa kolumny)"
      value={optionsEndDateColumn}
      onFocus={() => {
        optionsLastActiveTextFieldId.current = "options-enddate-column";
      }}
      onChange={handleOptionsEndDateColumnChange}
    />
  );
}

export default optionsEndDateColumn;
