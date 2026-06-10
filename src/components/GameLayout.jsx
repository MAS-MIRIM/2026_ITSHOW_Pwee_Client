import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import WebcamSplitView from './WebcamSplitView'
import MemoCharacterCard from './MemoCharacterCard'
import ScoreBoard from './ScoreBoard'
import { useGameSession } from '../context/gameSession'
import { getOrCreateUser, createSocket } from '../api/multiApi'
import bombImage from '../assets/bomb.svg'

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

const ScoresRow = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
`

const CamFrame = styled.div`
  position: relative;
  width: 100%;
  margin-top: 56px;
`

const popIn = keyframes`
  from { transform: translateY(-8px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
`

const PenaltyAlert = styled.div`
  position: absolute;
  top: 8px;
  ${({ $side }) => $side === 'left' ? 'left: 8px;' : 'right: 8px;'}
  width: calc(50% - 30px);
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: clamp(6px, 1vw, 12px);
  pointer-events: none;
  box-sizing: border-box;
  text-align: center;
  animation: ${popIn} 0.25s ease;
`

const PenaltyAlertBomb = styled.img`
  position: relative;
  z-index: 2;
  width: clamp(120px, 18vw, 210px);
  height: auto;
  display: block;
  margin-bottom: clamp(-46px, -4.5vw, -30px);
  filter: drop-shadow(0 12px 14px rgba(70, 60, 60, 0.26));
`

const PenaltyAlertBox = styled.div`
  position: relative;
  z-index: 1;
  width: min(88%, 260px);
  padding: clamp(20px, 2.8vw, 28px) clamp(16px, 2.5vw, 24px) clamp(14px, 2vw, 18px);
  background: #fffdf8;
  border: 1.5px solid rgba(133, 107, 107, 0.3);
  border-radius: 18px;
  box-shadow: 0 8px 18px rgba(70, 60, 60, 0.16);
  box-sizing: border-box;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  font-size: clamp(12px, 1.35vw, 15px);
  font-weight: 700;
  color: #463c3c;
  line-height: 1.45;
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
  return c.toDataURL('image/jpeg', 0.82)
}

function captureFullMirrored(video) {
  const w = video.videoWidth
  const h = video.videoHeight
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  ctx.save()
  ctx.translate(w, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0, w, h)
  ctx.restore()
  return c.toDataURL('image/jpeg', 0.82)
}

function toImageSrc(value) {
  if (!value || typeof value !== 'string') return null
  const src = value.trim()
  if (!src) return null
  if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('blob:')) {
    return src
  }
  const looksLikeImageBase64 =
    src.startsWith('/9j/') ||
    src.startsWith('iVBOR') ||
    src.startsWith('R0lGOD') ||
    src.startsWith('UklGR')
  if (looksLikeImageBase64) {
    const mime = src.startsWith('iVBOR')
      ? 'image/png'
      : src.startsWith('R0lGOD')
        ? 'image/gif'
        : src.startsWith('UklGR')
          ? 'image/webp'
          : 'image/jpeg'
    return `data:${mime};base64,${src}`
  }
  if (src.startsWith('/')) return `${BASE_SERVER}${src}`
  return `data:image/jpeg;base64,${src}`
}

function pickFourFrames(frames) {
  const total = frames.length
  if (total === 0) return [null, null, null, null]
  return [0, 1, 2, 3].map((i) => {
    const idx = Math.min(Math.floor((i / 4) * total), total - 1)
    return frames[idx] ?? null
  })
}

function getRoundWinnerId(data, previousScores, nextScores) {
  const directWinner = [
    data.winner_user_id,
    data.winner_id,
    data.user_id,
    data.winner?.user_id,
    data.winner?.id,
  ].find((id) => id !== undefined && id !== null)

  if (directWinner !== undefined) return String(directWinner)

  const increasedIds = Object.entries(nextScores ?? {})
    .filter(([userId, score]) => Number(score ?? 0) > Number(previousScores?.[userId] ?? 0))
    .map(([userId]) => userId)

  return increasedIds.length === 1 ? increasedIds[0] : null
}

/* ── 메인 컴포넌트 ── */
export default function GameLayout({ onFinish, nickname }) {
  const [phase, setPhase] = useState('connecting')  // connecting | waiting | playing | done | error
  const [errMsg, setErrMsg] = useState(null)

  const [currentExpr, setCurrentExpr] = useState(null)
  const [round, setRound] = useState(0)
  const [total, setTotal] = useState(10)
  const [scores, setScores] = useState({})
  const [penalty, setPenalty] = useState(null)       // { userId, expr, name, emoji, label }
  const [streakWarning, setStreakWarning] = useState(null)
  const [players, setPlayers] = useState({ p1: null, p2: null })

  const socketRef = useRef(null)
  const roomIdRef = useRef(null)
  const p1Ref = useRef(null)
  const p2Ref = useRef(null)
  const scoresRef = useRef({})
  const roundStartScoresRef = useRef({})
  const streakRef = useRef({ userId: null, count: 0 })
  const leftVideoRef = useRef(null)
  const rightVideoRef = useRef(null)
  const frameTimerRef = useRef(null)
  const finishedRef = useRef(false)
  const fourCutHandledRef = useRef(false)
  const recentPhotoFramesRef = useRef([])

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
      setPlayers({ p1: u1, p2: u2 })
      roomIdRef.current = generateRoomId()

      const socket = createSocket()
      socketRef.current = socket

      socket.on('room_joined', () => {
        setPhase('waiting')
      })

      socket.on('round_start', (data) => {
        setCurrentExpr(data.expression)   // 이제 {key, label, emoji} 객체
        setScores(data.scores ?? {})
        roundStartScoresRef.current = data.scores ?? {}
        setRound((data.round_index ?? data.current_index ?? 0) + 1)
        if (data.total) setTotal(data.total)
        setPhase('playing')
      })

      socket.on('frame_result', (data) => {
        if (data.scores) setScores(data.scores)
      })

      socket.on('round_won', (data) => {
        const prevScores = roundStartScoresRef.current
        const s = data.scores ?? {}
        const winnerId = getRoundWinnerId(data, prevScores, s)
        setScores(s)
        roundStartScoresRef.current = s

        if (winnerId) {
          const isSameWinner = streakRef.current.userId === winnerId
          const count = isSameWinner ? streakRef.current.count + 1 : 1
          streakRef.current = { userId: winnerId, count }

          if (count >= 3) {
            const warningUser = [p1Ref.current, p2Ref.current]
              .find((user) => String(user?.user_id) === winnerId)

            setStreakWarning({
              userId: warningUser?.user_id ?? winnerId,
              name: warningUser?.username ?? '플레이어',
              count,
            })
          } else {
            setStreakWarning(null)
          }
        }

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
        }

        if (data.total) setTotal(data.total)

        if (!data.game_finished && data.next_expression) {
          setRound((prev) => {
            if (data.round_index !== undefined || data.current_index !== undefined) {
              return (data.round_index ?? data.current_index) + 1
            }
            return Math.min(prev + 1, data.total ?? Number.MAX_SAFE_INTEGER)
          })
          setCurrentExpr(data.next_expression)
        }
      })

      socket.on('penalty_update', (data) => {
        if (data.cleared) {
          setPenalty(null)
          setStreakWarning(null)
        }
      })

      const finishFourCut = (data = {}) => {
        if (fourCutHandledRef.current) return
        fourCutHandledRef.current = true
        const s = scoresRef.current
        const p1Id = p1Ref.current.user_id
        const p2Id = p2Ref.current.user_id
        const lifeFourCut = toImageSrc(data.image ?? data.life_four_cut ?? data.lifeFourCut)
        setResult({
          mode: 'multi',
          score: { left: s[p1Id] ?? 0, right: s[p2Id] ?? 0 },
          lifeFourCut,
        })
        const localFallback = pickFourFrames(recentPhotoFramesRef.current)
        const shots = Array.from({ length: 4 }, (_, i) => {
          const serverShot =
            data.fail_photos?.[i] ??
            data.fail_photo_base64s?.[i] ??
            data.fail_photo_urls?.[i]
          return toImageSrc(serverShot) ?? localFallback[i]
        })
        setFailShots(shots)
        socket.disconnect()
        onFinish()
      }

      socket.on('game_over', async () => {
        if (finishedRef.current) return
        finishedRef.current = true
        clearInterval(frameTimerRef.current)
        setPhase('done')
        setPenalty(null)
        setStreakWarning(null)

        socket.emit('request_four_cut', {
          room_id: roomIdRef.current,
          user_id: p1Ref.current.user_id,
        })

        window.setTimeout(() => finishFourCut(), 3500)
      })

      socket.on('life_four_cut', (data) => {
        finishFourCut(data)
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

    const tick = () => {
      const video = leftVideoRef.current ?? rightVideoRef.current
      if (!video || video.readyState < 2 || video.videoWidth === 0) return
      if (!socket?.connected) return

      const frame1 = captureHalf(video, 'right') // P1: 화면 왼쪽 = 비디오 오른쪽
      const frame2 = captureHalf(video, 'left')  // P2: 화면 오른쪽 = 비디오 왼쪽
      const fullFrame = captureFullMirrored(video)
      recentPhotoFramesRef.current = [...recentPhotoFramesRef.current, fullFrame].slice(-40)

      // 패널티 중인 플레이어는 penalty_frame, 나머지는 submit_frame
      if (penalty && penalty.userId === p1.user_id) {
        socket.emit('penalty_frame', { room_id: roomId, user_id: p1.user_id, image_base64: frame1 })
      } else {
        socket.emit('submit_frame', { room_id: roomId, user_id: p1.user_id, image_base64: frame1, photo_base64: fullFrame })
      }

      if (penalty && penalty.userId === p2.user_id) {
        socket.emit('penalty_frame', { room_id: roomId, user_id: p2.user_id, image_base64: frame2 })
      } else {
        socket.emit('submit_frame', { room_id: roomId, user_id: p2.user_id, image_base64: frame2, photo_base64: fullFrame })
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

  if (phase === 'error') {
    return (
      <CenteredMsg>
        <span style={{ fontSize: 32 }}>⚠️</span>
        <span>{errMsg ?? '오류가 발생했습니다.'}</span>
        <span style={{ fontSize: '0.85rem', color: '#856b6b' }}>백엔드 서버가 실행 중인지 확인해 주세요.</span>
      </CenteredMsg>
    )
  }

  if (phase === 'done') {
    return (
      <CenteredMsg>
        <Spinner />
        <span>인생네컷 준비 중...</span>
      </CenteredMsg>
    )
  }

  /* ── 게임 화면 ── */
  const p1Id = players.p1?.user_id
  const p2Id = players.p2?.user_id

  const visibleWarning = penalty ?? streakWarning
  const warningSide = visibleWarning
    ? (String(visibleWarning.userId) === String(p1Id) ? 'left' : 'right')
    : null

  return (
    <Page>
      <Stage>
        <ProgressRow>
          라운드&nbsp;{round}&nbsp;/&nbsp;{total}
        </ProgressRow>

        <CamFrame>
          <WebcamSplitView leftVideoRef={leftVideoRef} rightVideoRef={rightVideoRef} />
          {visibleWarning && (
            <PenaltyAlert
              key={`${visibleWarning.userId}-${visibleWarning.expr ?? visibleWarning.count}`}
              $side={warningSide}
            >
              <PenaltyAlertBomb src={bombImage} alt="" aria-hidden="true" />
              <PenaltyAlertBox>
                {visibleWarning.name}님<br />
                {penalty
                  ? `${penalty.label} 표정을 지어주세요`
                  : `${visibleWarning.count}점 연속 획득 중입니다`}
              </PenaltyAlertBox>
            </PenaltyAlert>
          )}
          <MemoCharacterCard expression={currentExpr} emoji="🎭" />
        </CamFrame>

        <ScoresRow>
          <ScoreBoard label={players.p1?.username ?? 'P1'} value={scores[p1Id] ?? 0} />
          <ScoreBoard label={players.p2?.username ?? 'P2'} value={scores[p2Id] ?? 0} />
        </ScoresRow>
      </Stage>
    </Page>
  )
}
