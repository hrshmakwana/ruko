import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Attack from "./pages/Attack.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Attack />
  </StrictMode>,
);
