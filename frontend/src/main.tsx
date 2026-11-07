import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import './index.css'
import { BrowserRouter } from "react-router";
import App from './App.tsx'

const root = (document.getElementById("root")!);

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <StrictMode>
    <App />
    </StrictMode>
  </BrowserRouter>,
);


