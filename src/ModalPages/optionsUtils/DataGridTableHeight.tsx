import { TextField } from "@mui/material";
import { useEffect } from "react";
import { useThemeContext } from "../../contexts/ThemeContext";

function DataGridTableHeight() {
  const { dataGridTableHeight, setDataGridTableHeight, optionsLastActiveTextFieldId } = useThemeContext();

  const handleDataGridTableHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataGridTableHeight(Number(event.target.value));
  };

  useEffect(() => {
    if (optionsLastActiveTextFieldId.current === "data-grid-table-height") {
      document.getElementById("data-grid-table-height")?.focus();
    }
    // console.log(optionsLastActiveTextFieldId.current);
  }, [dataGridTableHeight]); 

  return (
    <TextField
      id="data-grid-table-height"
      variant="standard"
      type="number"
      sx={{ width: "100%" }}
      label="Wysokość tabeli (px)"
      value={dataGridTableHeight}
      onFocus={() => {
        optionsLastActiveTextFieldId.current = "data-grid-table-height";
      }}
      onChange={handleDataGridTableHeightChange}
    />
  );
}

export default DataGridTableHeight;
