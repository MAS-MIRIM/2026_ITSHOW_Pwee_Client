import { useCallback, useMemo, useState } from 'react'
import { GameSessionContext } from './gameSession'

export function GameSessionProvider({ children }) {
  const [captures, setCaptures] = useState([])
  const [fourCutShots, setFourCutShots] = useState([null, null, null, null])
  const [filterShot, setFilterShot] = useState(null)
  const [result, setResultState] = useState(null)

  const pushCapture = useCallback((dataUrl) => {
    setCaptures((prev) => [...prev, dataUrl])
  }, [])

  const setResult = useCallback((data) => {
    setResultState(data)
  }, [])

  const pickFourCut = useCallback(() => {
    setCaptures((prev) => {
      const total = prev.length
      if (total === 0) {
        setFourCutShots([null, null, null, null])
        return prev
      }
      const picked = [0, 1, 2, 3].map((i) => {
        const idx = Math.min(Math.floor((i / 4) * total), total - 1)
        return prev[idx] ?? null
      })
      setFourCutShots(picked)
      return prev
    })
  }, [])

  const setFilterShotCb = useCallback((dataUrl) => {
    setFilterShot(dataUrl)
  }, [])

  const ctx = useMemo(
    () => ({
      captures,
      fourCutShots,
      filterShot,
      result,
      pushCapture,
      setResult,
      pickFourCut,
      setFilterShot: setFilterShotCb,
    }),
    [captures, fourCutShots, filterShot, result, pushCapture, setResult, pickFourCut, setFilterShotCb],
  )

  return <GameSessionContext.Provider value={ctx}>{children}</GameSessionContext.Provider>
}