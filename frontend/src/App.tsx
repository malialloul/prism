import React, { useMemo, useState } from "react";
import { createAppTheme } from "./styles/theme";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages/Home/Home";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import ChangePassword from "./pages/ChangePassword/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";

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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </Router>
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default App;
