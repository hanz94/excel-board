import { Checkbox, Typography } from "@mui/material";
import { useThemeContext } from "../../contexts/ThemeContext";

function TrimRows() {

    const { trimRows, setTrimRows } = useThemeContext();

    return ( 
        //the boolean value below (trimRows) is always converted to string because of the localStorage
        <Typography sx={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.28rem", mt: "0.5rem"}}>
            <Checkbox 
                id="trim-rows" 
                checked={trimRows === 'true'} 
                onChange={(e) => setTrimRows(e.target.checked)}
                sx={{ pl: 0 }} />

                Zakończ wyświetlanie na pierwszym pustym wierszu

        </Typography>
     );
}

export default TrimRows;