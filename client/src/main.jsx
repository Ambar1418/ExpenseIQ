import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

// Dismiss splash screen after React mounts and first paint completes
if (typeof window.__hideSplash === 'function') {
  // Use requestAnimationFrame to ensure first paint is done
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__hideSplash()
    })
  })
}
