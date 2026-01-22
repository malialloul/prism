import {
  Container,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import { Brightness4, Brightness7, Storage } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../../App";
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
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
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
              Get Started
            </Button>
          </RightBox>
        </StyledToolbar>
      </Container>
    </StyledAppBar>
  );
}
