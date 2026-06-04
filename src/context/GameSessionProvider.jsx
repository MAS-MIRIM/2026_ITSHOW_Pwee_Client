import { useCallback, useMemo, useState } from 'react'
import { GameSessionContext } from './gameSession'

export function GameSessionProvider({ children }) {
  const [captures, setCaptures] = useState([])
  const [fourCutShots, setFourCutShots] = useState([null, null, null, null])
  const [filterShot, setFilterShot] = useState(null)
  const [result, setResultState] = useState(null)
  const [failShots, setFailShotsState] = useState([null, null, null, null])
  const [shareImage, setShareImageState] = useState(null)
  const [videoGameId, setVideoGameIdState] = useState(null)

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

  const setFailShots = useCallback((shots) => {
    const normalized = Array.from({ length: 4 }, (_, i) => shots[i] ?? null)
    setFailShotsState(normalized)
  }, [])

  const updateFailShot = useCallback((index, dataUrl) => {
    setFailShotsState((prev) => {
      const next = [...prev]
      next[index] = dataUrl
      return next
    })
  }, [])

  const setShareImage = useCallback((dataUrl) => {
    setShareImageState(dataUrl)
  }, [])

  const setVideoGameId = useCallback((id) => {
    setVideoGameIdState(id)
  }, [])

  const ctx = useMemo(
    () => ({
      captures,
      fourCutShots,
      filterShot,
      result,
      failShots,
      shareImage,
      videoGameId,
      pushCapture,
      setResult,
      pickFourCut,
      setFilterShot: setFilterShotCb,
      setFailShots,
      updateFailShot,
      setShareImage,
      setVideoGameId,
    }),
    [captures, fourCutShots, filterShot, result, failShots, shareImage, videoGameId, pushCapture, setResult, pickFourCut, setFilterShotCb, setFailShots, updateFailShot, setShareImage, setVideoGameId],
  )

  return <GameSessionContext.Provider value={ctx}>{children}</GameSessionContext.Provider>
}