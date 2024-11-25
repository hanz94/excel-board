import { createContext, useContext } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocalStorageState } from '@toolpad/core';
import { lighten, darken } from '@mui/material';

type ModeType = "light" | "dark" | null;
interface ThemeContextType {
    mode: ModeType;
    setMode: (mode: ModeType) => void;
    toggleTheme: () => void;
  }

  const ThemeContext = createContext<ThemeContextType | null>(null);

  const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
    const prefersDarkMode = useMediaQuery<boolean>('(prefers-color-scheme: dark)');
    const [mode, setMode] = useLocalStorageState<ModeType>('selectedMode', prefersDarkMode ? 'dark' : 'light');

    const appTheme = createTheme({
        palette: {
            mode: mode ?? 'light', // Dynamically sets mode to light or dark
            primary: {
            main: mode === 'dark' ? lighten('#1976d2', 0.25) : '#1976d2',
            },
            secondary: {
            main: '#dc004e',
            },
            background: {
            default: mode === 'dark' ? lighten('#121212', 0.12) : darken('#ffffff', 0.1), // Background color based on mode
            },
            text: {
            primary: mode === 'dark' ? '#ffffff' : '#000000', // Text color based on mode
            },
        },
        components: {
            MuiInputBase: {
            styleOverrides: {
                input: {
                color: mode === 'dark' ? 'white' : 'black', // Font color adapts to mode
                },
            },
            },
            MuiInputAdornment: {
            styleOverrides: {
                root: {
                color: mode === 'dark' ? 'white' : 'black', // Adornment color adapts to mode
                },
            },
            },
            MuiOutlinedInput: {
            styleOverrides: {
                root: {
                '& fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black', // Border color adapts to mode
                },
                '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black', // Hover border color adapts to mode
                },
                '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black', // Focused border color adapts to mode
                },
                },
            },
            },
            MuiInputLabel: {
                styleOverrides: {
                  root: {
                    color: mode === 'dark' ? 'white' : 'black', // Default label color
                    '&.Mui-focused': {
                      color: mode === 'dark' ? 'white' : 'black', // Label color when focused
                    },
                  },
                },
              },
            MuiTextField: {
            styleOverrides: {
                root: {
                marginBottom: '16px',
                '& .MuiInputBase-input': {
                    color: mode === 'dark' ? 'white' : 'black', // Font color adapts to mode
                },
                },
            },
            },
            MuiFileInput: {
            styleOverrides: {
                root: {
                marginBottom: '16px',
                '& .MuiInputBase-input': {
                    color: mode === 'dark' ? 'white' : 'black', // File input text color adapts to mode
                },
                },
            },
            },
        },
    });

        const toggleTheme = () => {
            setMode(mode === 'light' ? 'dark' : 'light');
          };

return (
    <ThemeContext.Provider value={{ mode, setMode, toggleTheme }}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};


const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
      throw new Error('useThemeContext must be used within a ThemeContextProvider');
    }
    return context;
  };
  
  export { ThemeContextProvider, useThemeContext };