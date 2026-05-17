import { useCallback, useMemo, useRef, useState } from 'react'
import { GameSessionContext } from './gameSession'

const MAX_BUFFER = 12

export function GameSessionProvider({ children }) {
  const [mode, setMode] = useState(null)
  const [result, setResultState] = useState(null)
  const [fourCutShots, setFourCutShots] = useState([])
  const [filterShot, setFilterShotState] = useState(null)
  const capturedRef = useRef([])

  const pushCapture = useCallback((dataUrl) => {
    if (!dataUrl) return
    const next = [...capturedRef.current, dataUrl]
    if (next.length > MAX_BUFFER) next.shift()
    capturedRef.current = next
  }, [])

  const setResult = useCallback((value) => {
    setResultState(value)
    if (value?.mode) setMode(value.mode)
  }, [])

  const pickFourCut = useCallback(() => {
    const buf = capturedRef.current
    if (buf.length === 0) {
      setFourCutShots([])
      return []
    }
    // Mock selection: evenly sample 4 across the buffer.
    // Swap with face-match-score ranking once available.
    const step = buf.length / 4
    const picks = [0, 1, 2, 3].map((i) => buf[Math.min(buf.length - 1, Math.floor(i * step))])
    setFourCutShots(picks)
    return picks
  }, [])

  const setFilterShot = useCallback((dataUrl) => {
    setFilterShotState(dataUrl)
  }, [])

  const reset = useCallback(() => {
    capturedRef.current = []
    setFourCutShots([])
    setFilterShotState(null)
    setResultState(null)
    setMode(null)
  }, [])

  const value = useMemo(
    () => ({
      mode,
      result,
      fourCutShots,
      filterShot,
      pushCapture,
      setResult,
      pickFourCut,
      setFilterShot,
      reset,
    }),
    [mode, result, fourCutShots, filterShot, pushCapture, setResult, pickFourCut, setFilterShot, reset],
  )

  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>
}
