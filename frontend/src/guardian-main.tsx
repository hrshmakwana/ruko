import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Guardian from "./pages/Guardian.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Guardian />
  </StrictMode>,
);
