import { useEffect, useRef, useState } from 'react'
import styled, { css, keyframes } from 'styled-components'
import WebcamSplitView from './WebcamSplitView'
import MemoCharacterCard from './MemoCharacterCard'
import ScoreBoard from './ScoreBoard'
import { useGameSession } from '../context/gameSession'
import { getOrCreateUser, createSocket } from '../api/multiApi'

const FRAME_MS = 350
const BASE_SERVER = 'http://localhost:5001'

/* ── 공통 페이지 ── */
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

/* ── 대기/연결 화면 ── */
const CenteredMsg = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #fffdf2;
  font-family: 'Suez One', Georgia, serif;
  color: #463c3c;
`

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid rgba(133,107,107,0.25);
  border-top-color: #856b6b;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`

/* ── 게임 화면 ── */
const Stage = styled.div`
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(12px, 1.8vw, 20px);
  padding-top: clamp(40px, 5vh, 64px);
`

const ExprRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`

const flash = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`

const ExprCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border: 2px solid #856b6b;
  border-radius: 14px;
  background: ${({ $feedback }) =>
    $feedback === 'won' ? '#d4edda' : $feedback === 'penalty' ? '#fde0de' : '#f8e9c8'};
  transition: background 0.25s;
  ${({ $feedback }) => $feedback && css`animation: ${flash} 0.5s ease;`}
`

const ExprEmoji = styled.span`
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1;
`

const ExprLabel = styled.span`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(14px, 1.8vw, 20px);
  color: #463c3c;
`

const RoundBadge = styled.span`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(12px, 1.4vw, 15px);
  color: #856b6b;
  letter-spacing: 0.06em;
`

const ScoresRow = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
`

const CamFrame = styled.div`
  position: relative;
  width: 100%;
`

const PenaltyBanner = styled.div`
  background: #fde0de;
  border: 2px solid #c44545;
  border-radius: 12px;
  padding: 10px 20px;
  text-align: center;
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(12px, 1.4vw, 15px);
  color: #c44545;
`

const flashIn = keyframes`
  0%   { opacity: 0; transform: scale(0.7); }
  30%  { opacity: 1; transform: scale(1.08); }
  60%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
`

const PenaltyFlash = styled.div`
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(196, 69, 69, 0.18);
  pointer-events: none;
  animation: ${flashIn} 2s ease forwards;
`

const PenaltyFlashTitle = styled.div`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(48px, 8vw, 80px);
  color: #c44545;
  letter-spacing: 0.04em;
  text-shadow: 0 4px 20px rgba(196,69,69,0.35);
`

const PenaltyFlashSub = styled.div`
  font-family: Georgia, serif;
  font-size: clamp(16px, 2.2vw, 22px);
  color: #463c3c;
  text-align: center;
`

/* ── 유틸 ── */
function generateRoomId() {
  return 'room-' + Math.random().toString(36).slice(2, 8)
}

function captureHalf(video, side) {
  const w = video.videoWidth
  const h = video.videoHeight
  const hw = Math.floor(w / 2)
  const c = document.createElement('canvas')
  c.width = hw
  c.height = h
  const ctx = c.getContext('2d')
  ctx.save()
  ctx.translate(hw, 0)
  ctx.scale(-1, 1)
  const sx = side === 'left' ? 0 : hw
  ctx.drawImage(video, sx, 0, hw, h, 0, 0, hw, h)
  ctx.restore()
  return c.toDataURL('image/jpeg', 0.72)
}

/* ── 메인 컴포넌트 ── */
export default function GameLayout({ onFinish, nickname }) {
  const [phase, setPhase] = useState('connecting')  // connecting | waiting | playing | done | error
  const [errMsg, setErrMsg] = useState(null)

  const [currentExpr, setCurrentExpr] = useState(null)
  const [round, setRound] = useState(0)
  const [total, setTotal] = useState(10)
  const [scores, setScores] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [penalty, setPenalty] = useState(null)       // { userId, expr, name }
  const [penaltyFlash, setPenaltyFlash] = useState(null) // { name, expr } — 2초간 표시

  const socketRef = useRef(null)
  const roomIdRef = useRef(null)
  const p1Ref = useRef(null)
  const p2Ref = useRef(null)
  const scoresRef = useRef({})
  const videoRef = useRef(null)
  const leftVideoRef = useRef(null)
  const rightVideoRef = useRef(null)
  const frameTimerRef = useRef(null)
  const finishedRef = useRef(false)

  const { setResult, setFailShots } = useGameSession()

  // 스코어는 ref로도 유지 (life_four_cut 핸들러에서 최신값 참조)
  useEffect(() => { scoresRef.current = scores }, [scores])

  useEffect(() => {
    let cancelled = false
    async function init() {
    try {
      const p2AutoName = (nickname || '플레이어') + '2'
      const [u1, u2] = await Promise.all([
        getOrCreateUser(nickname || '플레이어1'),
        getOrCreateUser(p2AutoName),
      ])
      if (cancelled) return
      p1Ref.current = u1
      p2Ref.current = u2
      roomIdRef.current = generateRoomId()

      const socket = createSocket()
      socketRef.current = socket

      socket.on('room_joined', (data) => {
        setPhase('waiting')
      })

      socket.on('round_start', (data) => {
        setCurrentExpr(data.expression)   // 이제 {key, label, emoji} 객체
        setScores(data.scores ?? {})
        setRound((data.round_index ?? 0) + 1)
        if (data.total) setTotal(data.total)
        setFeedback(null)
        setPhase('playing')
      })

      socket.on('frame_result', (data) => {
        if (data.scores) setScores(data.scores)
      })

      socket.on('round_won', (data) => {
        const s = data.scores ?? {}
        setScores(s)
        setFeedback('won')
        setTimeout(() => setFeedback(null), 600)

        if (data.penalty_assigned) {
          const pa = data.penalty_assigned
          const info = {
            userId: pa.user_id,
            expr: pa.penalty,
            emoji: pa.emoji ?? '⚠️',
            label: pa.label ?? pa.penalty,
            name: pa.username,
          }
          setPenalty(info)
          setPenaltyFlash(info)
          setTimeout(() => setPenaltyFlash(null), 2000)
        }

        if (!data.game_finished && data.next_expression) {
          setCurrentExpr(data.next_expression)
        }
      })

      socket.on('penalty_update', (data) => {
        if (data.cleared) {
          setPenalty(null)
        }
      })

      socket.on('game_over', async () => {
        if (finishedRef.current) return
        finishedRef.current = true
        clearInterval(frameTimerRef.current)
        setPhase('done')

        socket.emit('request_four_cut', {
          room_id: roomIdRef.current,
          user_id: p1Ref.current.user_id,
        })
      })

      socket.on('life_four_cut', (data) => {
        const s = scoresRef.current
        const p1Id = p1Ref.current.user_id
        const p2Id = p2Ref.current.user_id
        setResult({
          mode: 'multi',
          score: { left: s[p1Id] ?? 0, right: s[p2Id] ?? 0 },
          lifeFourCut: data.image,
        })
        const shots = Array.from({ length: 4 }, (_, i) => {
          const url = data.fail_photo_urls?.[i]
          return url ? `${BASE_SERVER}${url}` : null
        })
        setFailShots(shots)
        socket.disconnect()
        onFinish()
      })

      socket.on('connect_error', (err) => {
        if (!cancelled) { setErrMsg('서버 연결 실패: ' + err.message); setPhase('error') }
      })

      socket.connect()

      socket.once('connect', () => {
        socket.emit('join_room', { room_id: roomIdRef.current, user_id: u1.user_id })
        socket.emit('join_room', { room_id: roomIdRef.current, user_id: u2.user_id })
      })

    } catch (err) {
      if (!cancelled) { setErrMsg(err.message); setPhase('error') }
    }
    }
    init()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 프레임 캡처 루프
  useEffect(() => {
    if (phase !== 'playing') return

    const socket = socketRef.current
    const roomId = roomIdRef.current
    const p1 = p1Ref.current
    const p2 = p2Ref.current
    const penaltyRef_live = { current: penalty }

    const tick = () => {
      const video = leftVideoRef.current ?? rightVideoRef.current
      if (!video || video.readyState < 2 || video.videoWidth === 0) return
      if (!socket?.connected) return

      const frame1 = captureHalf(video, 'right') // P1: 화면 왼쪽 = 비디오 오른쪽
      const frame2 = captureHalf(video, 'left')  // P2: 화면 오른쪽 = 비디오 왼쪽

      // 패널티 중인 플레이어는 penalty_frame, 나머지는 submit_frame
      if (penalty && penalty.userId === p1.user_id) {
        socket.emit('penalty_frame', { room_id: roomId, user_id: p1.user_id, image_base64: frame1 })
      } else {
        socket.emit('submit_frame', { room_id: roomId, user_id: p1.user_id, image_base64: frame1 })
      }

      if (penalty && penalty.userId === p2.user_id) {
        socket.emit('penalty_frame', { room_id: roomId, user_id: p2.user_id, image_base64: frame2 })
      } else {
        socket.emit('submit_frame', { room_id: roomId, user_id: p2.user_id, image_base64: frame2 })
      }
    }

    frameTimerRef.current = setInterval(tick, FRAME_MS)
    return () => clearInterval(frameTimerRef.current)
  }, [phase, penalty])

  // 언마운트 정리
  useEffect(() => {
    return () => {
      clearInterval(frameTimerRef.current)
      socketRef.current?.disconnect()
    }
  }, [])

  if (phase === 'connecting' || phase === 'waiting') {
    return (
      <CenteredMsg>
        <Spinner />
        <span>{phase === 'connecting' ? '서버에 연결 중...' : '게임 준비 중...'}</span>
      </CenteredMsg>
    )
  }

  if (phase === 'done') {
    return (
      <CenteredMsg>
        <Spinner />
        <span>결과 처리 중...</span>
      </CenteredMsg>
    )
  }

  if (phase === 'error') {
    return (
      <CenteredMsg>
        <span style={{ fontSize: 32 }}>⚠️</span>
        <span>{errMsg ?? '오류가 발생했습니다.'}</span>
        <span style={{ fontSize: '0.85rem', color: '#856b6b' }}>백엔드 서버가 실행 중인지 확인해 주세요.</span>
      </CenteredMsg>
    )
  }

  /* ── 게임 화면 ── */
  const p1Id = p1Ref.current?.user_id
  const p2Id = p2Ref.current?.user_id

  return (
    <Page>
      {penaltyFlash && (
        <PenaltyFlash key={penaltyFlash.name + penaltyFlash.expr}>
          <PenaltyFlashTitle>⚠️ 패널티!</PenaltyFlashTitle>
          <PenaltyFlashSub>
            {penaltyFlash.name}님<br />
            {penaltyFlash.emoji} {penaltyFlash.label} 표정을 지어주세요
          </PenaltyFlashSub>
        </PenaltyFlash>
      )}
      <Stage>
        <ExprRow>
          <RoundBadge>{round} / {total}</RoundBadge>
          <ExprCard $feedback={feedback}>
            <ExprEmoji>{currentExpr?.emoji ?? '🎭'}</ExprEmoji>
            <ExprLabel>{currentExpr?.label ?? '표정을 따라해 주세요'}</ExprLabel>
          </ExprCard>
        </ExprRow>

        {penalty && (
          <PenaltyBanner>
            ⚠️ {penalty.name}님 패널티 중 — {penalty.emoji} {penalty.label} 표정을 지어주세요!
          </PenaltyBanner>
        )}

        <CamFrame>
          <WebcamSplitView leftVideoRef={leftVideoRef} rightVideoRef={rightVideoRef} />
          <MemoCharacterCard />
        </CamFrame>

        <ScoresRow>
          <ScoreBoard label={p1Ref.current?.username ?? 'P1'} value={scores[p1Id] ?? 0} />
          <ScoreBoard label={p2Ref.current?.username ?? 'P2'} value={scores[p2Id] ?? 0} />
        </ScoresRow>
      </Stage>
    </Page>
  )
}
