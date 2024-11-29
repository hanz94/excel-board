import { useState, useEffect } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import '../App.css';
import { FormControl, InputLabel, Select, MenuItem, TextField, Typography } from '@mui/material';
import * as alasql from 'alasql';
import * as XLSX from 'xlsx';
import { MuiFileInput } from 'mui-file-input';
import { useThemeContext } from '../contexts/ThemeContext';

alasql.utils.isBrowserify = false;
alasql.utils.global.XLSX = XLSX;


function SqlApp() {

  const { mode, setMode } = useThemeContext();

  const [data, setData] = useState({});

  const [alasqlQuery, setAlasqlQuery] = useState('');
  const [alasqlQueryBefore, setAlasqlQueryBefore] = useState('');
  const [alasqlQuerySource, setAlasqlQuerySource] = useState('');
  const [alasqlQueryAfter, setAlasqlQueryAfter] = useState('');

  const [inputFileValue, setInputFileValue] = useState('');
  const [availableWorkSheets, setAvailableWorkSheets] = useState([]);
  const [currrentWorksheet, setCurrentWorksheet] = useState('');

  //execute AlaSQL query
  useEffect(() => {
    if (alasqlQuery) {
      alasql.promise(alasqlQuery)
        .then((result) => {
          setData(result);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setData({});
        });
    }
  }, [alasqlQuery]);

  //merge AlaSQL query @to be checked: potential trim issue
  useEffect(() => {
    if (alasqlQueryBefore || alasqlQuerySource || alasqlQueryAfter) {
      setAlasqlQuery(alasqlQueryBefore + ' ' + alasqlQuerySource + ' ' + alasqlQueryAfter);
    } else {
      setAlasqlQuery(''); // Reset alasqlQuery when all inputs are empty
    }
  }, [alasqlQueryBefore, alasqlQuerySource, alasqlQueryAfter]);

  //change current worksheet
  useEffect(() => {
    if (alasqlQuerySource) {
      // Use a regular expression to find and replace the sheetid value
      const updatedSource = alasqlQuerySource.replace(
        /{sheetid: "(.*?)", autoExt: false}/,
        `{sheetid: "${currrentWorksheet}", autoExt: false}`
      );
      setAlasqlQuerySource(updatedSource);
    }
  }, [currrentWorksheet]);

  const handleFileChange = (newInputValue) => {
    const file = newInputValue;
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const data = e.target.result; // Binary string or array buffer
        let workbook = XLSX.read(data, { type: 'binary' });

        console.log(workbook.SheetNames);
        setAvailableWorkSheets(() => workbook.SheetNames);
        setCurrentWorksheet(() => workbook.SheetNames[workbook.SheetNames.length - 1]);  // default current worksheet - the last one
  
        // Store temporary path for AlaSQL
        let tmppath = URL.createObjectURL(file);
  
        setInputFileValue(() => file);
        setAlasqlQueryBefore('SELECT *');
        setAlasqlQuerySource(`FROM ${fileExtension}("${tmppath}", {sheetid: "${currrentWorksheet}", autoExt: false})`);
        setAlasqlQueryAfter('');
      };
  
      reader.readAsBinaryString(file); // Read file as binary string
    } else {
      setInputFileValue('');
      alert('Invalid file type! Please upload a CSV, XLS, or XLSX file.');
    }
  };

    return ( 
        <>

      <DarkModeSwitch checked={mode === 'dark'} onChange={() => setMode(mode === 'dark' ? 'light' : 'dark')} size={24} sunColor='currentColor' moonColor='currentColor'
      style={{position: 'absolute', top: '17px', right: '17px'}}/>

      <MuiFileInput
        label="Wybierz plik CSV/XLS/XLSX"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        value={inputFileValue}
        onChange={handleFileChange}
        sx={{
          mb: 2,
        }} 
      />

      {availableWorkSheets.length > 0 && currrentWorksheet && (
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
      )}

      <TextField 
        // disabled={!inputFileValue}
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
        // disabled={!inputFileValue}
        fullWidth
        autoComplete='off'
        id="outlined-basic"
        label="SQL After"
        variant="outlined"
        value={alasqlQueryAfter}
        onChange={(e) => setAlasqlQueryAfter(e.target.value)}
        sx={{
          mb: 2,
        }}
      />

      {/* {alasqlQuery && 
        <>
            <Typography variant="h6">Final SQL Query: </Typography>
            <Typography variant="h6" sx={{mb: 2}}>{alasqlQuery}</Typography>
        </>
      } */}

      <table className="table table-striped">
        <thead>
          <tr>
            {data.length > 0 ? (
              Object.keys(data[0]).map((key, index) => (
                <th key={index}>{key}</th>
              ))
            ) : (
              <th></th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex}>
                    {value instanceof Date
                    ? value.toLocaleDateString()
                    : String(value)}
                    </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="100%">Waiting for data...</td>
            </tr>
          )}
        </tbody>
      </table>
      
      </>
     );
}

export default SqlApp;