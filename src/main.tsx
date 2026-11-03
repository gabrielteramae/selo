import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Elemento #root não encontrado.");

createRoot(root).render(
  <StrictMode>
    <main className="px-5 py-7">
      <h1 className="font-display text-4xl text-cream">Selo</h1>
    </main>
  </StrictMode>,
);
