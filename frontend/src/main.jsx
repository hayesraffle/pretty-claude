import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CodeDisplayProvider } from './contexts/CodeDisplayContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CodeDisplayProvider>
      <App />
    </CodeDisplayProvider>
  </StrictMode>,
)
