import React from 'react';
import ReactDOM from 'react-dom';
import Amplify from "aws-amplify";
import { Provider } from "react-redux";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import deepOrange from "@material-ui/core/colors/deepOrange";


import store from "./store/configureStore";
import App from './App';
import './index.css';
import config from './aws-exports'
Amplify.configure(config)

const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#8561c5",
      main: "#673ab7",
      dark: "#482880",
      contrastText: "#fff"
    },
    secondary: deepOrange
  }
});


ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <CssBaseline>
        <App />
      </CssBaseline>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('root')
);
