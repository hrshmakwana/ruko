import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Landing from "./pages/Landing.tsx";
import { applyLanguage, loadLanguage } from "./i18n";
import { registerServiceWorker } from "./lib/install";
import "./index.css";

applyLanguage(loadLanguage());

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Landing />
  </StrictMode>,
);
