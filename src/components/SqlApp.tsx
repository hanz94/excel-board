import { useState, useEffect } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import '../App.css';
import TextField from '@mui/material/TextField';
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
  const [inputValue, setInputValue] = useState('');

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

  const handleFileChange = (newInputValue) => {
    const file = newInputValue;
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const data = e.target.result; // Binary string or array buffer
        let workbook = XLSX.read(data, { type: 'binary' });
  
        // Store temporary path for AlaSQL
        let tmppath = URL.createObjectURL(file);
  
        setInputValue(() => file);
        setAlasqlQuery(`SELECT * FROM ${fileExtension}("${tmppath}", {sheetid: "${workbook.SheetNames[workbook.SheetNames.length - 1]}", autoExt: false})`);
      };
  
      reader.readAsBinaryString(file); // Read file as binary string
    } else {
      setInputValue('');
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
      value={inputValue}
      onChange={handleFileChange}
      sx={{
        mb: 2,
      }} />

    <TextField 
        fullWidth
        autoComplete='off'
        id="outlined-basic"
        label="SQL"
        variant="outlined"
        value={alasqlQuery}
        onChange={(e) => setAlasqlQuery(e.target.value)}
        sx={{
          mb: 2,
        }}
      />

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