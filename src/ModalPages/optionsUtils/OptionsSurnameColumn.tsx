import { TextField } from "@mui/material";
import { useEffect } from "react";
import { useThemeContext } from "../../contexts/ThemeContext";

function optionsSurnameColumn() {
  const { optionsSurnameColumn, setOptionsSurnameColumn, optionsLastActiveTextFieldId } = useThemeContext();

  const handleOptionsSurnameColumnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptionsSurnameColumn(String(event.target.value));
  };

  useEffect(() => {
    if (optionsLastActiveTextFieldId.current === "options-surname-column") {
      document.getElementById("options-surname-column")?.focus();
    }
    // console.log(optionsLastActiveTextFieldId.current);
  }, [[optionsSurnameColumn]]); 

  return (
    <TextField
      id="options-surname-column"
      variant="standard"
      type="text"
      sx={{ width: "100%" }}
      label="Nazwisko (nazwa kolumny)"
      value={optionsSurnameColumn}
      onFocus={() => {
        optionsLastActiveTextFieldId.current = "options-surname-column";
      }}
      onChange={handleOptionsSurnameColumnChange}
    />
  );
}

export default optionsSurnameColumn;
