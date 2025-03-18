import { useState, useEffect } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import '../App.css';
import { FormControl, InputLabel, Select, MenuItem, Typography, Checkbox, Box, FormControlLabel, ToggleButton, ToggleButtonGroup } from '@mui/material';
import * as alasql from 'alasql';
import * as XLSX from 'xlsx';
import { MuiFileInput } from 'mui-file-input';
import { useThemeContext } from '../contexts/ThemeContext';
import { useModalContext } from '../contexts/ModalContext';
import kulLogoBlack from '../assets/kul_logo-black.jpg';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import SettingsIcon from '@mui/icons-material/Settings';
import { DataGrid } from '@mui/x-data-grid';
import { plPL } from '@mui/x-data-grid/locales';
import ModalWindow from './ModalWindow';
import newModalContent from '../utils/newModalContent';


alasql.utils.isBrowserify = false;
alasql.utils.global.XLSX = XLSX;


function SqlApp() {

  const { mode, setMode, dataGridTableHeight, dataGridColumnWidth, trimRows, rowWithColumnNames, optionsNameColumn, optionsSurnameColumn, optionsStartDateColumn, optionsEndDateColumn } = useThemeContext();
  const { modalOpen } = useModalContext();

  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [slicedData, setSlicedData] = useState([]);

  //set app mode - 'arrivals' (przyjazdy) or 'departures' (wyjazdy)
  const [appMode, setAppMode] = useState('arrivals');

  const [alasqlQuery, setAlasqlQuery] = useState('');
  const [alasqlQueryBefore, setAlasqlQueryBefore] = useState('');
  const [alasqlQuerySource, setAlasqlQuerySource] = useState('');
  const [alasqlQueryAfter, setAlasqlQueryAfter] = useState('');

  const [inputFileValue, setInputFileValue] = useState('');
  const [currentWorkbook, setCurrentWorkbook] = useState('');
  const [availableWorkSheets, setAvailableWorkSheets] = useState([]);
  const [currrentWorksheet, setCurrentWorksheet] = useState('');
  // const [currentWorksheetRange, setCurrentWorksheetRange] = useState('');
  const [availableColumns, setAvailableColumns] = useState([]);

  const [useDataGrid, setUseDataGrid] = useState(false);  // true - render DataGrid (with filters), false - render Table (without filters)

  // set AlaSQL query based on appMode: arrivals (przyjazdy) or departures (wyjazdy)
  useEffect(() => {
    if (appMode === 'arrivals') {
      setAlasqlQueryBefore(`SELECT [${optionsNameColumn}], [${optionsSurnameColumn}], "Powrót za " + DATEDIFF(day, NOW(), [${optionsEndDateColumn}]) + " dni" as POWROT`);
      setAlasqlQueryAfter(`WHERE [${optionsEndDateColumn}] IS NOT NULL ORDER BY [${optionsEndDateColumn}]`);
    } else if (appMode === 'departures') {
      setAlasqlQueryBefore(`SELECT [${optionsNameColumn}], [${optionsSurnameColumn}], "Wyjazd za " + DATEDIFF(day, NOW(), [${optionsStartDateColumn}]) + " dni" as WYJAZD`);
      setAlasqlQueryAfter(`WHERE [${optionsStartDateColumn}] IS NOT NULL ORDER BY [${optionsStartDateColumn}]`);
    }
  }, [appMode, optionsNameColumn, optionsSurnameColumn, optionsStartDateColumn, optionsEndDateColumn]);

  //remove data after empty rows - fix for group by
const alasqlRemoveDataAfterFirstEmptyRow = function (rows) {
  // Find the index of the first empty row
  const emptyRowIndex = rows.findIndex(row =>
      Object.values(row).every(value => value === null || value === undefined || value === "")
  );
  // Return rows up to the first empty row
  return emptyRowIndex === -1 ? rows : rows.slice(0, emptyRowIndex);
};

  //execute AlaSQL query
  useEffect(() => {
    if (inputFileValue && alasqlQuery && trimRows === 'true') {
        alasql.promise('SELECT * ' + alasqlQuerySource)
        .then((result) => {
          let tmpData = result;
          tmpData = alasqlRemoveDataAfterFirstEmptyRow(tmpData);

          alasql.promise(alasqlQueryBefore + ' FROM ? ' + alasqlQueryAfter, [tmpData])
          .then((result) => {
            setData(result);
            setOriginalData(result);
            setSlicedData(result);
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
            setData([]);
          });
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setData([]);
        });
      }
      else if (inputFileValue && alasqlQuery) {
        alasql.promise(alasqlQuery)
        .then((result) => {
          setData(result);
          setOriginalData(result);
          let firstEmptyRowIndex = result.findIndex(obj => Object.keys(obj).length === 0);
          setSlicedData(result.slice(0,firstEmptyRowIndex));
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setData([]);
        });
      }
  }, [alasqlQuery, trimRows]);

  //merge AlaSQL query
  useEffect(() => {
    if (alasqlQueryBefore || alasqlQuerySource || alasqlQueryAfter) {
      setAlasqlQuery(alasqlQueryBefore + ' ' + alasqlQuerySource + ' ' + alasqlQueryAfter);
    } else {
      setAlasqlQuery(''); // Reset alasqlQuery when all inputs are empty
    }
    console.log('alasqlQuery: ', alasqlQuery);
  }, [alasqlQueryBefore, alasqlQuerySource, alasqlQueryAfter]);

  //Change current worksheet
  useEffect(() => {
    if (inputFileValue && alasqlQuerySource) {

      // Get the current worksheet range
      let newCurrentWorksheetRange = currentWorkbook.Sheets[currrentWorksheet]["!ref"];

      //Replace A1 with A + rowWithColumnNames
      newCurrentWorksheetRange = newCurrentWorksheetRange.replace(/A(.*?):/, `A${rowWithColumnNames}:`);

      // Use RegExp to find and replace the sheetid value
      let updatedSource = alasqlQuerySource.replace(
        /{sheetid: "(.*?)", autoExt: false/,
        `{sheetid: "${currrentWorksheet}", autoExt: false`
      );

      // Use RegExp to find and replace the range value
      updatedSource = updatedSource.replace(
        /range: "(.*?)"/,
        `range: "${newCurrentWorksheetRange}"`
      );

      updateAvailableColumns(currentWorkbook, currrentWorksheet, newCurrentWorksheetRange);
      setAlasqlQuerySource(updatedSource);
      // setCurrentWorksheetRange(newCurrentWorksheetRange);
    }
  }, [currrentWorksheet, rowWithColumnNames]);

//Trim the first empty row and all rows below
useEffect(() => {

  if (inputFileValue && trimRows === 'true') {
    setData(slicedData);
  }
  else if (inputFileValue && trimRows !== 'true') {
    setData(originalData);
  }

}, [originalData, slicedData, trimRows]);

const handleAppModeChange = (event, newAppMode) => {
  if (newAppMode !== null) {
    setAppMode(newAppMode);
  }
};

const handleFileChange = (newInputValue) => {
  const file = newInputValue;
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop()?.toLowerCase();

  if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
    const reader = new FileReader();

    reader.onload = (e) => {
      let data = e.target.result; // Binary string or array buffer
      let workbook = XLSX.read(data, { type: 'binary' });
      // console.log(workbook);
      setCurrentWorkbook(() => workbook);

      // console.log(workbook.SheetNames);
      setAvailableWorkSheets(() => workbook.SheetNames);

      // Set default worksheet as the last sheet
      const defaultSheetName = workbook.SheetNames[workbook.SheetNames.length - 1];
      setCurrentWorksheet(() => defaultSheetName);

      // Get the default worksheet range e.g. A1:H100
      let defaultWorksheetRange = workbook.Sheets[defaultSheetName]["!ref"];

      //Replace A1 with A + rowWithColumnNames
      defaultWorksheetRange = defaultWorksheetRange.replace('A1', `A${rowWithColumnNames}`);
      // setCurrentWorksheetRange(() => defaultWorksheetRange);

      // console.log(defaultWorksheetRange)

      // Call the new function to update columns based on the default sheet
      updateAvailableColumns(workbook, defaultSheetName, defaultWorksheetRange);

      // Store temporary path for AlaSQL
      let tmppath = URL.createObjectURL(file);

      // let currentRange = workbook.Sheets[defaultSheetName]["!ref"];

      setInputFileValue(() => file);
      // setAlasqlQueryBefore('SELECT *');
      setAlasqlQuerySource(`FROM ${fileExtension}("${tmppath}", {sheetid: "${defaultSheetName}", autoExt: false, range: "${defaultWorksheetRange}"})`);
      // setAlasqlQueryAfter('');
    };

    reader.readAsBinaryString(file); // Read file as binary string
  } else {
    setInputFileValue('');
    alert('Invalid file type! Please upload a CSV, XLS, or XLSX file.');
  }
};

const updateAvailableColumns = (workbook, sheetName, range) => {
  const worksheet = workbook.Sheets[sheetName];
  const sheetRange = XLSX.utils.decode_range(range);
  // const sheetRange = XLSX.utils.decode_range(worksheet["!ref"]);

  // Extract column headers (first row values)
  const columnHeaders = [];
  for (let colIndex = sheetRange.s.c; colIndex <= sheetRange.e.c; colIndex++) {
    const cellAddress = XLSX.utils.encode_cell({ r: rowWithColumnNames - 1, c: colIndex }); // Get the cell address in the first row
    const cellValue = worksheet[cellAddress]?.v; // Retrieve the cell's value
    if (cellValue) columnHeaders.push(cellValue);
  }

  setAvailableColumns(columnHeaders); // Set the available columns
};



    return ( 
        <>
      {/* Page Wrapper */}
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'space-between', flexDirection: 'column', height: '100%', p:2.5, overflow: 'auto'}}>

      <ModalWindow />

      {/* Page Header */}
      <Box sx={{height: '48px', position: 'relative', top: 0, mb: 1, display: 'flex', justifyContent: 'space-between'}}>
        <Box>
          <img
            src={kulLogoBlack}
            style={{position: 'absolute', top: '0px', left: '0px', width: 105, height: 32, cursor: 'pointer'}}
            onClick={() => window.location.reload()}
            />
        </Box>
        <Box sx={{width: 116}}>
          <SettingsIcon sx={{cursor: 'pointer'}} onClick={() => modalOpen(newModalContent.options)} />
          <DarkModeSwitch checked={mode === 'dark'} onChange={() => setMode(mode === 'dark' ? 'light' : 'dark')} size={24} sunColor='currentColor' moonColor='currentColor'
          style={{position: 'absolute', top: '0px', right: '0px'}}/>
        </Box>

      {/* End Page Header */}
      </Box>


      {/* Page App */}
      <Box>

      <MuiFileInput
        label={inputFileValue ? "Plik CSV/XLS/XLSX" : "Wybierz plik CSV/XLS/XLSX"}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        value={inputFileValue}
        onChange={handleFileChange}
        sx={{
          mb: 2,
        }} 
      />

      {availableWorkSheets.length > 0 && currrentWorksheet && (
        <>
        <FormControl sx={{ mb: 2, ml: 1, minWidth: 150 }}>
          <InputLabel id="select-worksheet-label">Arkusz</InputLabel>
          <Select
            labelId="select-worksheet-label"
            id="select-worksheet"
            value={currrentWorksheet}
            label="Arkusz"
            onChange={(e) => setCurrentWorksheet(e.target.value)}
          >
            {availableWorkSheets.map((worksheet) => (
              <MenuItem key={worksheet} value={worksheet}>
                {worksheet}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography>
          <FormControlLabel control={<Checkbox checked={useDataGrid} onChange={(e) => setUseDataGrid(e.target.checked)} />} label="Filtrowanie zaawansowane" />
        </Typography>

        <ToggleButtonGroup
          color="primary"
          value={appMode}
          exclusive
          onChange={handleAppModeChange}
          sx={{
            mt: 0.5,
            mb: 1
          }}
        >
          <ToggleButton value="departures">Wyjazdy</ToggleButton>
          <ToggleButton value="arrivals">Przyjazdy</ToggleButton>
        </ToggleButtonGroup>

        </>
      )}

      {/* old code - set alasqlQuery from text input */}

      {/* <TextField 
        fullWidth
        autoComplete='off'
        id="outlined-basic"
        label="SQL Before"
        variant="outlined"
        value={alasqlQueryBefore}
        onChange={(e) => setAlasqlQueryBefore(e.target.value)}
        sx={{
          mb: 2,
        }}
      />
      <TextField 
        disabled
        autoComplete='off'
        id="outlined-basic"
        label="SQL Source"
        variant="outlined"
        value={alasqlQuerySource}
        onChange={(e) => setAlasqlQuerySource(e.target.value)}
        sx={{
          mb: 2,
        }}
      />

      <TextField 
        fullWidth
        autoComplete='off'
        id="outlined-basic"
        label="SQL After"
        variant="outlined"
        value={alasqlQueryAfter}
        onChange={(e) => setAlasqlQueryAfter(e.target.value)}
        sx={{
          mb: 3,
        }}
      /> */}

      {(inputFileValue && data.length > 0 && currrentWorksheet) && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>{currrentWorksheet}</Typography>
        </>
      )}

      <TableContainer component={Paper} sx={{ maxHeight: dataGridTableHeight + 'px', overflow: 'auto' }}>

        {data.length > 0 ? (
          <>
            {/* {console.log(data)} */}

            {useDataGrid ? (
              // Render DataGrid
              <Paper sx={{ height: dataGridTableHeight + 'px', width: '100%' }}>
                <DataGrid
                  localeText={plPL.components.MuiDataGrid.defaultProps.localeText} 
                  rows={data.map((row, index) => ({ id: index, ...row }))}
                  columns={
                    data.length > 0 && data[0]
                      ? Object.keys(data[0]).map((key) => ({
                          field: key,
                          headerName: key,
                          // flex: 1,
                          minWidth: dataGridColumnWidth,
                          valueFormatter: (params) => {
                            if (typeof params === 'undefined') {
                              return '(Puste)';
                            }
                            return params instanceof Date ? params.toLocaleDateString() : String(params);
                          },
                        }))
                      : [] // Fallback to an empty array if no data is available
                  }
                  sx={{
                    border: 0,
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 'bold', // Makes column headers bold
                    },
                  }}
                  // pageSize can exceed 100 only in the Pro or Premium version
                  // pageSize={data.length}
                  // pageSizeOptions={[25, 50, 100, data.length]}
                />
              </Paper>
            ) : (
              // Render Table
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {Object.keys(data[0]).map((key) => (
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }} key={key}>
                        {key}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <TableCell key={colIndex}>
                          {value instanceof Date ? value.toLocaleDateString() : String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        ) : (
          <Table>
            <TableBody>
              <TableRow>
                <TableCell align="center" colSpan={1}>
                  {inputFileValue ? 'Invalid SQL Query...' : 'Wybierz plik, aby wyświetlić dane'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* End Page App */}
      </Box>
      
      {/* Page Footer */}
      <Box>
      <Typography variant="div" sx={{ fontSize: 10, textAlign: 'center', my: 1 }}>
        KUL (Katolicki Uniwersytet Lubelski) - Dział Współpracy Międzynarodowej &copy; 2024-2025 Bartłomiej Pawłowski - Excel Board 1.1
      </Typography>
      </Box>

      {/* End Page Wrapper */}
      </Box>

      </>
     )
}

export default SqlApp;