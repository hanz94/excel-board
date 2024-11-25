import { ThemeContextProvider } from './contexts/ThemeContext';
import SqlApp from './components/SqlApp';

function App() {

  return (
    <ThemeContextProvider>
      <SqlApp />
    </ThemeContextProvider>
  );
}

export default App;