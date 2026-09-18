import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { applyLanguage, loadLanguage } from "./i18n";
import { registerServiceWorker } from "./lib/install";
import "./index.css";

registerServiceWorker();

applyLanguage(loadLanguage());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
