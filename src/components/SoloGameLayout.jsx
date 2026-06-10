import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import WebcamSoloView from './WebcamSoloView'
import MemoCharacterCard from './MemoCharacterCard'
import AccuracyProgress from './AccuracyProgress'
import { useGameSession } from '../context/gameSession'
import { startSoloGame, sendFrame, finishSoloGame } from '../api/soloApi'

const FRAME_INTERVAL_MS = 350

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
  padding-top: clamp(8px, 2vh, 24px);
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
  margin-top: 56px;
`

const RoundTimerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
`

const AccuracyWrap = styled.div`
  width: min(420px, 100%);
  align-self: center;
`

const TimerLabel = styled.span`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(16px, 2vw, 22px);
  color: #463c3c;
  font-variant-numeric: tabular-nums;
`

const TimerText = styled.span`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(13px, 1.5vw, 16px);
  color: #856b6b;
  font-weight: 800;
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

const GameOverOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: clamp(20px, 5vw, 48px);
  background: rgba(31, 26, 26, 0.72);
  backdrop-filter: blur(3px);
  pointer-events: auto;
`

const GameOverPanel = styled.div`
  width: min(100%, 560px);
  height: min(78vh, 720px);
  display: grid;
  grid-template-rows: auto 1fr auto;
  justify-items: center;
  padding: clamp(16px, 4vw, 32px);
  text-align: center;
`

const GameOverTitle = styled.h1`
  margin: 0;
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(48px, 9vw, 96px);
  line-height: 0.95;
  color: #fffdf2;
  letter-spacing: 0;
  white-space: nowrap;
  text-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
`

const RecordBox = styled.div`
  width: min(100%, 420px);
  align-self: center;
  padding: 8px 0;
  display: grid;
  place-items: center;
  gap: 6px;
`

const RecordLabel = styled.span`
  color: rgba(255, 253, 242, 0.78);
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: 14px;
  font-weight: 800;
`

const RecordValue = styled.strong`
  color: #fffdf2;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-weight: 900;
  font-size: clamp(42px, 8vw, 68px);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 6px 22px rgba(0, 0, 0, 0.42);
`

const NextButton = styled.button`
  width: min(100%, 320px);
  min-height: 56px;
  align-self: end;
  border-radius: 999px;
  border: none;
  background: #463c3c;
  color: #fffdf2;
  box-shadow: 0 6px 0 #241f1f, 0 12px 22px rgba(70, 60, 60, 0.18);
  cursor: pointer;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(16px, 1.8vw, 18px);
  font-weight: 900;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.15s ease;

  &:hover { filter: brightness(1.03); }
  &:active { transform: translateY(3px); box-shadow: 0 3px 0 #241f1f; }
  &:focus-visible { outline: 3px solid rgba(255, 253, 242, 0.82); outline-offset: 4px; }
`

function formatTime(ms) {
  if (!ms) return '0.00s'
  return `${(ms / 1000).toFixed(2)}s`
}

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
  const [targetScore, setTargetScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [finalTimeMs, setFinalTimeMs] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)

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

        setTargetScore(res.target_score ?? 0)
        setProgress((prev) => ({ ...prev, current: res.current_index ?? prev.current }))

        if (res.finished) {
          finishedRef.current = true
          try {
            const fin = await finishSoloGame(gameIdRef.current, nickname ?? '익명')
            const finishedTime = fin.clear_time_ms ?? elapsedMs
            setFinalTimeMs(finishedTime)
            setResult({
              mode: 'solo',
              timeMs: finishedTime,
              lifeFourCut: fin.life_four_cut ? `data:image/jpeg;base64,${fin.life_four_cut}` : null,
            })
            const shots = Array.from({ length: 4 }, (_, i) => {
              const b64 = fin.fail_shots?.[i]
              return b64 ? `data:image/jpeg;base64,${b64}` : null
            })
            setFailShots(shots)
          } catch {
            const fallbackTime = res.clear_time_ms ?? elapsedMs
            setFinalTimeMs(fallbackTime)
            setResult({ mode: 'solo', timeMs: fallbackTime })
          }
          setGameOver(true)
          return
        }

        if (res.matched || res.timed_out) {
          const nextFeedback = res.matched ? 'matched' : 'timeout'
          setFeedback(nextFeedback)
          setCurrentExpr(res.next_expression)
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

  useEffect(() => {
    if (loading || errorMsg || gameOver) return
    const startedAt = performance.now() - elapsedMs
    const id = setInterval(() => {
      setElapsedMs(performance.now() - startedAt)
    }, 100)
    return () => clearInterval(id)
  }, [loading, errorMsg, gameOver]) // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <Page>
      <Stage>
        <ProgressRow>
          라운드&nbsp;{progress.current + 1}&nbsp;/&nbsp;{progress.total}
        </ProgressRow>

        <CamFrame>
          <WebcamSoloView videoRef={videoRef} />
          <MemoCharacterCard expression={currentExpr} emoji="🎭" />
        </CamFrame>

        <AccuracyWrap>
          <AccuracyProgress value={targetScore} />
        </AccuracyWrap>

        <RoundTimerRow>
          <TimerText>총 플레이 시간</TimerText>
          <TimerLabel>{formatTime(elapsedMs)}</TimerLabel>
        </RoundTimerRow>
      </Stage>
      {gameOver && (
        <GameOverOverlay>
          <GameOverPanel role="dialog" aria-modal="true" aria-labelledby="time-over-title">
            <GameOverTitle id="time-over-title">TIME OVER</GameOverTitle>
            <RecordBox>
              <RecordLabel>최종 플레이 시간</RecordLabel>
              <RecordValue>{formatTime(finalTimeMs)}</RecordValue>
            </RecordBox>
            <NextButton type="button" onClick={onFinish}>
              다음으로
            </NextButton>
          </GameOverPanel>
        </GameOverOverlay>
      )}
    </Page>
  )
}
