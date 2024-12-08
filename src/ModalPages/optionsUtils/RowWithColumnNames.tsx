import { TextField } from "@mui/material";
import { useEffect } from "react";
import { useThemeContext } from "../../contexts/ThemeContext";

function RowWithColumnNames() {
  const { rowWithColumnNames, setRowWithColumnNames, optionsLastActiveTextFieldId } = useThemeContext();

  const handleRowWithColumnNamesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowWithColumnNames(Number(event.target.value));
  };

  useEffect(() => {
    if (optionsLastActiveTextFieldId.current === "row-with-column-names") {
      document.getElementById("row-with-column-names")?.focus();
    }
    // console.log(optionsLastActiveTextFieldId.current);
  }, [rowWithColumnNames]); 

  return (
    <TextField
      id="row-with-column-names"
      variant="standard"
      type="number"
      sx={{ width: "100%" }}
      label="Wiersz z nazwami kolumn"
      value={rowWithColumnNames}
      onFocus={() => {
        optionsLastActiveTextFieldId.current = "row-with-column-names";
      }}
      onChange={handleRowWithColumnNamesChange}
    />
  );
}

export default RowWithColumnNames;
