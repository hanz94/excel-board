import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import * as alasql from 'alasql';
import * as XLSX from 'xlsx';
import './App.css';
import { MuiFileInput } from 'mui-file-input';

alasql.utils.isBrowserify = false;
alasql.utils.global.XLSX = XLSX;

function App() {

  const [data, setData] = useState({});
  const [alasqlQuery, setAlasqlQuery] = useState('');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    alasql.promise(alasqlQuery)
      .then((result) => {
        setData(result);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setData({});
      });
  }, [alasqlQuery]);

  const handleFileChange = (newInputValue) => {
    const file = newInputValue;
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
      setInputValue(newInputValue);
      var tmppath = URL.createObjectURL(file);
      setAlasqlQuery(`SELECT * FROM ${fileExtension}("${tmppath}", {autoExt: false})`);
    }
    else {
      alert('Invalid file type! Please upload a CSV, XLS, or XLSX file.');
    }
  };

  return (
    <>

    <MuiFileInput
      label="Wybierz plik CSV/XLS/XLSX"
      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      value={inputValue}
      onChange={handleFileChange}
      sx={{
        mb: 2,
        '& .MuiInputBase-input': {
          color: 'white', // White font color for the input text
        },
        //MuiInputAdornment-root
        '& .MuiInputAdornment-root': {
          color: 'white', 
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'white', // White border color for notched outline
          },
          '&:hover fieldset': {
            borderColor: 'white', // White border color on hover
          },
          '&.Mui-focused fieldset': {
            borderColor: 'white', // White border color when focused
          },
        },
        '& .MuiInputLabel-root': {
          color: 'white', // White label color
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: 'white', // White label color when focused
        },
      }} />

    <TextField 
        fullWidth
        id="outlined-basic"
        label="SQL"
        variant="outlined"
        value={alasqlQuery}
        onChange={(e) => setAlasqlQuery(e.target.value)}
        sx={{
          mb: 2,
          '& .MuiInputBase-input': {
            color: 'white', // White font color
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white', // White border color
            },
            '&:hover fieldset': {
              borderColor: 'white', // White border on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white', // White border when focused
            },
          },
          '& .MuiInputLabel-root': {
            color: 'white', // White label color
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: 'white', // White label color when focused
          },
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
                  <td key={colIndex}>{value}</td>
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

export default App;
