import React from "react";
import ReactDOM from "react-dom/client";

// Order matters: Bootstrap first, then the design system, so our tokens
// and component overrides always win over Bootstrap's defaults.
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";
import "./styles/theme.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import store from "./Components/store";
import { Provider } from "react-redux";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
