import { TextField } from "@mui/material";
import { useEffect } from "react";
import { useThemeContext } from "../../contexts/ThemeContext";

function DataGridColumnWidth() {
  const { dataGridColumnWidth, setDataGridColumnWidth, optionsLastActiveTextFieldId } = useThemeContext();

  const handleDataGridColumnWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataGridColumnWidth(Number(event.target.value));
  };

  useEffect(() => {
    if (optionsLastActiveTextFieldId.current === "data-grid-column-width") {
      document.getElementById("data-grid-column-width")?.focus();
    }
    // console.log(optionsLastActiveTextFieldId.current);
  }, [dataGridColumnWidth]); 

  return (
    <TextField
      id="data-grid-column-width"
      variant="standard"
      type="number"
      sx={{ width: "100%" }}
      label="Szerokość kolumny filtrującej (px)"
      value={dataGridColumnWidth}
      onFocus={() => {
        optionsLastActiveTextFieldId.current = "data-grid-column-width";
      }}
      onChange={handleDataGridColumnWidthChange}
    />
  );
}

export default DataGridColumnWidth;
