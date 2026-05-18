import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { GameSessionProvider } from './context/GameSessionContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameSessionProvider>
      <App />
    </GameSessionProvider>
  </StrictMode>,
)
