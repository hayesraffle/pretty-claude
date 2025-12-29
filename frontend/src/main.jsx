import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CodeDisplayProvider } from './contexts/CodeDisplayContext'
import { SettingsProvider } from './contexts/SettingsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <CodeDisplayProvider>
        <App />
      </CodeDisplayProvider>
    </SettingsProvider>
  </StrictMode>,
)
