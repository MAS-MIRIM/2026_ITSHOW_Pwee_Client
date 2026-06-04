import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import WebcamSoloView from './WebcamSoloView'
import MemoCharacterCard from './MemoCharacterCard'
import { useGameSession } from '../context/gameSession'
import { startSoloGame, sendFrame, finishSoloGame } from '../api/soloApi'

const FRAME_INTERVAL_MS = 350
const ROUND_TOTAL_SEC = 15

const flash = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
`

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #fffdf2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 48px);
  box-sizing: border-box;
  overflow: hidden;
`

const Stage = styled.div`
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(12px, 1.8vw, 20px);
  padding-top: clamp(40px, 5vh, 64px);
`

const ProgressRow = styled.div`
  display: flex;
  justify-content: center;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(13px, 1.5vw, 16px);
  color: #856b6b;
  letter-spacing: 0.08em;
`

const CamFrame = styled.div`
  position: relative;
  width: 100%;
`

const RoundTimerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
`

const TimerLabel = styled.span`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(16px, 2vw, 22px);
  color: ${({ $warn }) => ($warn ? '#c44545' : '#463c3c')};
  font-variant-numeric: tabular-nums;
  transition: color 0.2s;
`

const TimerBarWrap = styled.div`
  width: clamp(120px, 20vw, 200px);
  height: 6px;
  border-radius: 999px;
  background: rgba(133, 107, 107, 0.18);
  overflow: hidden;
`

const TimerBarFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: ${({ $warn }) => ($warn ? '#c44545' : '#463c3c')};
  width: ${({ $pct }) => $pct}%;
  transition: width 0.35s linear, background 0.2s;
`

const CenteredMessage = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #fffdf2;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  color: #463c3c;
`

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid rgba(133, 107, 107, 0.25);
  border-top-color: #856b6b;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

export default function SoloGameLayout({ onFinish, nickname }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const gameIdRef = useRef(null)
  const processingRef = useRef(false)
  const finishedRef = useRef(false)

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [currentExpr, setCurrentExpr] = useState(null)
  const [progress, setProgress] = useState({ current: 0, total: 10 })
  const [roundTime, setRoundTime] = useState(ROUND_TOTAL_SEC)
  const [targetScore, setTargetScore] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const { setResult, setFailShots } = useGameSession()

  // Start game session
  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const data = await startSoloGame(nickname ?? '익명')
        if (cancelled) return
        gameIdRef.current = data.game_id
        setCurrentExpr(data.first_expression)
        setProgress({ current: 0, total: data.total })
        setLoading(false)
      } catch (err) {
        if (!cancelled) setErrorMsg(err.message)
      }
    }
    init()
    return () => { cancelled = true }
  }, [nickname])

  // Frame capture + send loop
  useEffect(() => {
    if (loading || errorMsg) return

    const tick = async () => {
      if (processingRef.current || finishedRef.current) return
      const video = videoRef.current
      if (!video || video.readyState < 2 || video.videoWidth === 0) return

      let canvas = canvasRef.current
      if (!canvas) {
        canvas = document.createElement('canvas')
        canvasRef.current = canvas
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      ctx.restore()
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82)

      processingRef.current = true
      try {
        const res = await sendFrame(gameIdRef.current, dataUrl)

        setRoundTime(res.round_time_remaining ?? ROUND_TOTAL_SEC)
        setTargetScore(res.target_score ?? 0)
        setProgress((prev) => ({ ...prev, current: res.current_index ?? prev.current }))

        if (res.finished) {
          finishedRef.current = true
          try {
            const fin = await finishSoloGame(gameIdRef.current, nickname ?? '익명')
            setResult({
              mode: 'solo',
              timeMs: fin.clear_time_ms,
              lifeFourCut: fin.life_four_cut ? `data:image/jpeg;base64,${fin.life_four_cut}` : null,
            })
            const shots = Array.from({ length: 4 }, (_, i) => {
              const b64 = fin.fail_shots?.[i]
              return b64 ? `data:image/jpeg;base64,${b64}` : null
            })
            setFailShots(shots)
          } catch {
            setResult({ mode: 'solo', timeMs: res.clear_time_ms ?? 0 })
          }
          onFinish()
          return
        }

        if (res.matched || res.timed_out) {
          const nextFeedback = res.matched ? 'matched' : 'timeout'
          setFeedback(nextFeedback)
          setCurrentExpr(res.next_expression)
          setRoundTime(ROUND_TOTAL_SEC)
          setTargetScore(0)
          setTimeout(() => setFeedback(null), 500)
        }
      } catch (err) {
        console.error('[solo] frame error:', err)
      } finally {
        processingRef.current = false
      }
    }

    const id = setInterval(tick, FRAME_INTERVAL_MS)
    return () => clearInterval(id)
  }, [loading, errorMsg, nickname, onFinish, setResult, setFailShots])

  if (errorMsg) {
    return (
      <CenteredMessage>
        <span style={{ fontSize: 32 }}>⚠️</span>
        <span>{errorMsg}</span>
        <span style={{ fontSize: '0.85rem', color: '#856b6b' }}>백엔드 서버가 실행 중인지 확인해 주세요.</span>
      </CenteredMessage>
    )
  }

  if (loading) {
    return (
      <CenteredMessage>
        <Spinner />
        <span>게임 준비 중...</span>
      </CenteredMessage>
    )
  }

  const timePct = Math.round((roundTime / ROUND_TOTAL_SEC) * 100)
  const timeWarn = roundTime <= 5

  return (
    <Page>
      <Stage>
        <ProgressRow>
          라운드&nbsp;{progress.current + 1}&nbsp;/&nbsp;{progress.total}
        </ProgressRow>

        <CamFrame>
          <WebcamSoloView videoRef={videoRef} />
          <MemoCharacterCard emoji={currentExpr?.emoji ?? '🎭'} label={currentExpr?.label} />
        </CamFrame>

        <RoundTimerRow>
          <TimerBarWrap>
            <TimerBarFill $pct={timePct} $warn={timeWarn} />
          </TimerBarWrap>
          <TimerLabel $warn={timeWarn}>{roundTime.toFixed(1)}s</TimerLabel>
        </RoundTimerRow>
      </Stage>
    </Page>
  )
}