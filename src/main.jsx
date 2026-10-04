import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TahunProvider } from "./context/TahunContext";
import { DocumentProvider } from "./context/DocumentContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <TahunProvider>
      <DocumentProvider>
        <App />
      </DocumentProvider>
    </TahunProvider>
  </StrictMode>
)



