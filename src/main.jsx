import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PlatformShell from './PlatformShell.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlatformShell />
  </StrictMode>,
)
