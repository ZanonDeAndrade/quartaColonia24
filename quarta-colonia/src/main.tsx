import React from "react";
import ReactDOM from "react-dom/client";
import "@repo/theme/theme.css";
import "./index.css";
import App from "./App";
import { keepBackendAlive } from "./utils/keepBackendAlive";

keepBackendAlive();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
