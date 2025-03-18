import { TextField } from "@mui/material";
import { useEffect } from "react";
import { useThemeContext } from "../../contexts/ThemeContext";

function optionsStartDateColumn() {
  const { optionsStartDateColumn, setOptionsStartDateColumn, optionsLastActiveTextFieldId } = useThemeContext();

  const handleOptionsStartDateColumnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptionsStartDateColumn(String(event.target.value));
  };

  useEffect(() => {
    if (optionsLastActiveTextFieldId.current === "options-startdate-column") {
      document.getElementById("options-startdate-column")?.focus();
    }
    // console.log(optionsLastActiveTextFieldId.current);
  }, [[optionsStartDateColumn]]); 

  return (
    <TextField
      id="options-startdate-column"
      variant="standard"
      type="text"
      sx={{ width: "100%" }}
      label="Data wyjazdu (nazwa kolumny)"
      value={optionsStartDateColumn}
      onFocus={() => {
        optionsLastActiveTextFieldId.current = "options-startdate-column";
      }}
      onChange={handleOptionsStartDateColumnChange}
    />
  );
}

export default optionsStartDateColumn;
