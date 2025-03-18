import { TextField } from "@mui/material";
import { useEffect } from "react";
import { useThemeContext } from "../../contexts/ThemeContext";

function optionsNameColumn() {
  const { optionsNameColumn, setOptionsNameColumn, optionsLastActiveTextFieldId } = useThemeContext();

  const handleOptionsNameColumnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptionsNameColumn(String(event.target.value));
  };

  useEffect(() => {
    if (optionsLastActiveTextFieldId.current === "options-name-column") {
      document.getElementById("options-name-column")?.focus();
    }
    // console.log(optionsLastActiveTextFieldId.current);
  }, [[optionsNameColumn]]); 

  return (
    <TextField
      id="options-name-column"
      variant="standard"
      type="text"
      sx={{ width: "100%" }}
      label="Imię (nazwa kolumny)"
      value={optionsNameColumn}
      onFocus={() => {
        optionsLastActiveTextFieldId.current = "options-name-column";
      }}
      onChange={handleOptionsNameColumnChange}
    />
  );
}

export default optionsNameColumn;
