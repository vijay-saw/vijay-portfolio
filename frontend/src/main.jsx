import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import AOS from "aos";
import "aos/dist/aos.css";

import { ThemeProvider } from "./theme";

AOS.init({
  duration: 800,
  offset: 80,
  once: true,
  easing: "ease-out",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

