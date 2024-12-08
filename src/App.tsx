import { ThemeContextProvider } from './contexts/ThemeContext';
import { ModalContextProvider } from './contexts/ModalContext';
import SqlApp from './components/SqlApp';

function App() {

  return (
    <ThemeContextProvider>
      <ModalContextProvider>
        <SqlApp />
      </ModalContextProvider>
    </ThemeContextProvider>
  );
}

export default App;