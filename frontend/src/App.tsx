import React, { useMemo, useState } from "react";
import { createAppTheme } from "./styles/theme";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import {
  BrowserRouter as Router,
} from "react-router-dom";
import Home from "./pages/Home/Home";

type AppContextType = {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
};

export const AppContext = React.createContext<AppContextType>({
  darkMode: true,
  setDarkMode: () => {},
});

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const appTheme = useMemo(() => createAppTheme(darkMode), [darkMode]);

  return (
    <ThemeProvider theme={appTheme}>
      <AppContext.Provider value={{ darkMode, setDarkMode }}>
        <CssBaseline />
        <Router>
          <Home />
        </Router>
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default App;
