import { useContext } from "react";
import {
  Container,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Storage, Brightness4, Brightness7 } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { UserAvatar } from "../../../components";
import { AppContext } from "../../../App";
import { getAuthToken } from "../../../api/httpClient";
import {
  StyledAppBar,
  StyledToolbar,
  LogoBox,
  LogoIcon,
  NavLinks,
  RightBox,
} from "./Navigation.styles";

export default function Navigation() {
  const { darkMode, setDarkMode } = useContext(AppContext);
  const isLoggedIn = !!getAuthToken();

  return (
    <StyledAppBar position="fixed" color="default">
      <Container maxWidth="lg">
        <StyledToolbar disableGutters>
          <LogoBox>
            <LogoIcon>
              <Storage sx={{ color: "white", fontSize: 24 }} />
            </LogoIcon>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Prism
            </Typography>
          </LogoBox>

          <NavLinks>
            <Button color="inherit" href="#features">
              Features
            </Button>
            <Button color="inherit" href="#how-it-works">
              How It Works
            </Button>
            <Button color="inherit" href="#pricing">
              Pricing
            </Button>
            <Button color="inherit" href="#docs">
              Docs
            </Button>
          </NavLinks>

          <RightBox>
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
            {isLoggedIn ? (
              <>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/dashboard"
                  sx={{
                    background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
                    },
                  }}
                >
                  Dashboard
                </Button>
                <UserAvatar variant={darkMode ? 'dark' : 'light'} />
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  component={RouterLink}
                  to="/signin"
                  color="inherit"
                  sx={{ fontWeight: 500 }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </RightBox>
        </StyledToolbar>
      </Container>
    </StyledAppBar>
  );
}
