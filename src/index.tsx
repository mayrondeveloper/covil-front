import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { RouterProvider } from "react-router-dom";
import { Container } from "@mui/material";
import { router } from "./router";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {green, grey, orange, red} from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: grey[900],
    },
    secondary: {
      main: orange[900],
    },
    success: {
      main: green[500],
      light: green[500],
      dark: green[500],
      contrastText: green[500],
    },
    error: {
      main: red[600],
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Container maxWidth={false} disableGutters>
        <RouterProvider router={router} />
      </Container>
    </ThemeProvider>
  </React.StrictMode>
);


reportWebVitals();
