import { createContext, useContext } from 'react'

export const GameSessionContext = createContext(null)

export function useGameSession() {
  const ctx = useContext(GameSessionContext)
  if (!ctx) throw new Error('useGameSession must be used inside <GameSessionProvider>')
  return ctx
}
