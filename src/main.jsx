import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PlatformShell from './PlatformShell.jsx'
import WelcomePage from './WelcomePage.jsx'

function Root() {
  const [showPlatform, setShowPlatform] = useState(false)

  if (showPlatform) {
    return <PlatformShell />
  }

  return <WelcomePage onEnter={() => setShowPlatform(true)} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
