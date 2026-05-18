import { useCallback, useEffect, useRef, useState } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { useGameSession } from '../context/gameSession'
import { getFaceLandmarker, LANDMARK } from '../utils/faceLandmarker'
import RoughFrame from './RoughFrame'
import bunnyUrl from '../assets/filters/bunny-ears.svg'
import glassesUrl from '../assets/filters/glasses.svg'
import heartUrl from '../assets/filters/heart.svg'

const COUNTDOWN_SEC = 15
const RING_R = 28
const RING_C = 2 * Math.PI * RING_R

const FILTERS = [
  { id: 'none', label: '없음', emoji: '✕' },
  { id: 'bunny', label: '토끼', emoji: '🐰' },
  { id: 'glasses', label: '안경', emoji: '👓' },
  { id: 'heart', label: '하트', emoji: '💗' },
]

const pop = keyframes`
  0% { transform: scale(0.9); opacity: 0.4; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #FFFDF2;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(12px, 2vw, 24px);
  box-sizing: border-box;
  overflow: auto;
`

const Stage = styled.div`
  width: min(720px, 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(14px, 1.6vw, 22px);
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'Suez One', Georgia, serif;
  padding: 0 4px;
`

const Title = styled.h1`
  font-size: clamp(22px, 2.8vw, 30px);
  color: #463C3C;
  margin: 0;
`

const Status = styled.div`
  font-family: Georgia, serif;
  font-size: clamp(11px, 1.3vw, 13px);
  color: #856B6B;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-top: 2px;
`

const RingWrap = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Ring = styled.svg`
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`

const RingCount = styled.span`
  position: relative;
  font-family: 'Suez One', Georgia, serif;
  font-size: 24px;
  color: ${({ $warn }) => ($warn ? '#C44545' : '#463C3C')};
  font-variant-numeric: tabular-nums;
  z-index: 1;
`

const CamWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 24px;
  background: #1F1A1A;
  padding: 8px;
  box-sizing: border-box;
`

const CamInner = styled.div`
  position: absolute;
  inset: 8px;
  border-radius: 18px;
  overflow: hidden;
  background: #000;
`

const Video = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
`

const Overlay = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  pointer-events: none;
`

const StatusOverlay = styled.div`
  position: absolute;
  inset: 8px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: ${({ $error }) => ($error ? 'rgba(80, 20, 20, 0.92)' : 'rgba(31, 26, 26, 0.78)')};
  color: #FFFDF2;
  font-family: Georgia, serif;
  text-align: center;
  padding: 18px;
  z-index: 3;

  .spin {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid rgba(255,253,242,0.25);
    border-top-color: #F8E9C8;
    animation: ${spin} 0.9s linear infinite;
  }
  .label {
    font-family: 'Suez One', Georgia, serif;
    font-size: clamp(13px, 1.5vw, 16px);
    letter-spacing: 0.1em;
  }
  .detail {
    font-size: 12px;
    color: #DCC9A8;
    max-width: 360px;
    word-break: keep-all;
  }
`

const RetryBtn = styled.button`
  font-family: 'Suez One', Georgia, serif;
  font-size: 14px;
  color: #463C3C;
  background: #F8E9C8;
  border: none;
  border-radius: 999px;
  padding: 8px 18px;
  cursor: pointer;
`

const FilterRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`

const Chip = styled.button`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(13px, 1.4vw, 15px);
  border-radius: 999px;
  padding: 10px 18px 10px 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 2px solid ${({ $active }) => ($active ? '#463C3C' : '#856B6B')};
  background: ${({ $active }) => ($active ? '#463C3C' : '#FFFAEB')};
  color: ${({ $active }) => ($active ? '#FFFDF2' : '#463C3C')};
  cursor: pointer;
  transition: transform 0.1s ease;

  &:active { transform: scale(0.96); }
  ${({ $active }) => $active && css`animation: ${pop} 0.25s ease-out;`}

  .emoji { font-size: 1.1em; }
`

const Shutter = styled.button`
  align-self: center;
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(16px, 1.8vw, 20px);
  color: #FFFDF2;
  background: #C44545;
  border: 3px solid #FFFDF2;
  border-radius: 999px;
  padding: 14px 38px;
  cursor: pointer;
  box-shadow: 0 0 0 3px #C44545, 0 8px 18px rgba(196, 69, 69, 0.35);
  transition: transform 0.12s ease;

  &:active { transform: scale(0.96); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`

function loadSticker(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function drawStickers(ctx, landmarks, filter, stickers, w, h) {
  if (!landmarks || filter === 'none') return
  const nose = landmarks[LANDMARK.noseTip]
  const leftEye = landmarks[LANDMARK.leftEyeOuter]
  const rightEye = landmarks[LANDMARK.rightEyeOuter]
  const forehead = landmarks[LANDMARK.foreheadTop]
  if (!nose || !leftEye || !rightEye || !forehead) return

  const eyeDx = (rightEye.x - leftEye.x) * w
  const eyeDy = (rightEye.y - leftEye.y) * h
  const eyeWidth = Math.hypot(eyeDx, eyeDy)
  const angle = Math.atan2(eyeDy, eyeDx)

  if (filter === 'bunny' && stickers.bunny) {
    const earsW = eyeWidth * 3
    const earsH = earsW
    const fx = forehead.x * w
    const fy = forehead.y * h - earsH * 0.55
    ctx.save()
    ctx.translate(fx, fy + earsH / 2)
    ctx.rotate(angle)
    ctx.drawImage(stickers.bunny, -earsW / 2, -earsH / 2, earsW, earsH)
    ctx.restore()
  }

  if (filter === 'glasses' && stickers.glasses) {
    const gW = eyeWidth * 2.4
    const gH = gW * (140 / 400)
    const cx = (leftEye.x + rightEye.x) / 2 * w
    const cy = (leftEye.y + rightEye.y) / 2 * h
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.drawImage(stickers.glasses, -gW / 2, -gH / 2, gW, gH)
    ctx.restore()
  }

  if (filter === 'heart' && stickers.heart) {
    const hSize = eyeWidth * 0.6
    const leftCheek = { x: leftEye.x * w - eyeWidth * 0.1, y: leftEye.y * h + eyeWidth * 0.8 }
    const rightCheek = { x: rightEye.x * w + eyeWidth * 0.1, y: rightEye.y * h + eyeWidth * 0.8 }
    ctx.drawImage(stickers.heart, leftCheek.x - hSize / 2, leftCheek.y - hSize / 2, hSize, hSize)
    ctx.drawImage(stickers.heart, rightCheek.x - hSize / 2, rightCheek.y - hSize / 2, hSize, hSize)
  }
}

function FilterPageInner({ onRetry, onDone }) {
  const { setFilterShot } = useGameSession()
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const rafRef = useRef(0)
  const landmarkerRef = useRef(null)
  const stickersRef = useRef({})
  const lastLandmarksRef = useRef(null)
  const filterRef = useRef('bunny')
  const shotTakenRef = useRef(false)

  const [filter, setFilter] = useState('bunny')
  const [cameraReady, setCameraReady] = useState(false)
  const [modelReady, setModelReady] = useState(false) // true on success OR fallback
  const [statusLabel, setStatusLabel] = useState('카메라 준비 중')
  const [statusDetail, setStatusDetail] = useState('')
  const [cameraError, setCameraError] = useState(null)
  const [modelError, setModelError] = useState(null)
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC)

  useEffect(() => { filterRef.current = filter }, [filter])

  // Phase A: camera. StrictMode dev runs this twice; the first run's cancelled flag
  // stops its stream on cleanup, the second run actually attaches.
  useEffect(() => {
    let stream = null
    let cancelled = false

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('이 브라우저는 카메라를 지원하지 않아요')
        }
        console.info('[filter] camera: requesting permission')
        setStatusLabel('카메라 권한 요청')
        setStatusDetail('')
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        console.info('[filter] camera: stream acquired')

        const video = videoRef.current
        if (!video) {
          console.warn('[filter] camera: video ref missing, aborting')
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        video.srcObject = stream
        // Some browsers won't auto-start playback even with autoPlay+muted when srcObject
        // is set after mount — call play() explicitly and swallow any benign rejection.
        try {
          await video.play()
          console.info('[filter] camera: video.play() resolved')
        } catch (playErr) {
          console.warn('[filter] camera: video.play() rejected (continuing):', playErr)
        }
        if (cancelled) return
        // Reveal the camera. Overlay dims are synced inside the rAF loop once
        // videoWidth becomes non-zero — no need to block on loadedmetadata.
        setCameraReady(true)
        setStatusLabel('준비 완료')
        setStatusDetail('')
        console.info('[filter] camera: ui unblocked, readyState=', video.readyState, 'paused=', video.paused)
      } catch (err) {
        console.error('[filter] camera failed:', err)
        const msg = err?.name === 'NotAllowedError'
          ? '카메라 권한이 거부되었습니다'
          : err?.name === 'NotReadableError'
            ? '카메라가 다른 곳에서 사용 중입니다'
            : (err?.message ?? '카메라를 사용할 수 없어요')
        setCameraError(msg)
      }
    }
    startCamera()

    const videoElAtSetup = videoRef.current
    return () => {
      cancelled = true
      if (stream) stream.getTracks().forEach((t) => t.stop())
      if (videoElAtSetup) videoElAtSetup.srcObject = null
    }
  }, [])

  // Phase B: MediaPipe + stickers (runs in parallel with camera).
  // Landmarker is a singleton, so double-invocation in StrictMode is harmless.
  useEffect(() => {
    let cancelled = false

    async function loadModel() {
      try {
        console.info('[filter] model: loading stickers + landmarker in parallel')
        const [landmarker, bunny, glasses, heart] = await Promise.all([
          getFaceLandmarker().catch((e) => {
            console.warn('[filter] model: landmarker rejected:', e)
            return null
          }),
          loadSticker(bunnyUrl),
          loadSticker(glassesUrl),
          loadSticker(heartUrl),
        ])
        if (cancelled) return

        landmarkerRef.current = landmarker
        stickersRef.current = { bunny, glasses, heart }

        if (!landmarker) {
          setModelError('AR 모델을 못 불러왔어요 (스티커 없이 진행)')
        }
        setModelReady(true)
        console.info('[filter] model: ready', { landmarker: !!landmarker, stickers: { bunny: !!bunny, glasses: !!glasses, heart: !!heart } })
      } catch (err) {
        console.error('[filter] model load failed:', err)
        setModelError(err?.message ?? 'AR 모델 로드 실패')
        setModelReady(true) // allow shutter even if model fails
      }
    }
    loadModel()

    return () => { cancelled = true }
  }, [])

  // Phase C: render loop — starts when camera is up. Landmarker is optional.
  useEffect(() => {
    if (!cameraReady) return undefined
    let cancelled = false

    const v = videoRef.current
    const overlay = overlayRef.current
    if (!v || !overlay) return undefined

    const ctx = overlay.getContext('2d')
    console.info('[filter] loop: starting')
    setStatusLabel('3/3 준비 완료')
    setStatusDetail('')

    const loop = () => {
      if (cancelled) return
      const video = videoRef.current
      if (video && video.readyState >= 2 && video.videoWidth) {
        if (overlay.width !== video.videoWidth) overlay.width = video.videoWidth
        if (overlay.height !== video.videoHeight) overlay.height = video.videoHeight
        ctx.clearRect(0, 0, overlay.width, overlay.height)
        const lm = landmarkerRef.current
        if (lm) {
          try {
            const result = lm.detectForVideo(video, performance.now())
            lastLandmarksRef.current = result?.faceLandmarks?.[0] ?? null
          } catch {
            /* keep last landmarks */
          }
          drawStickers(ctx, lastLandmarksRef.current, filterRef.current, stickersRef.current, overlay.width, overlay.height)
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
    }
  }, [cameraReady])

  const takeShot = useCallback(() => {
    if (shotTakenRef.current) return
    const video = videoRef.current
    const overlay = overlayRef.current
    if (!video || video.videoWidth === 0) return
    shotTakenRef.current = true

    const w = video.videoWidth
    const h = video.videoHeight
    const out = document.createElement('canvas')
    out.width = w
    out.height = h
    const ctx = out.getContext('2d')
    ctx.save()
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, w, h)
    if (overlay) ctx.drawImage(overlay, 0, 0, w, h)
    ctx.restore()

    const dataUrl = out.toDataURL('image/png')
    setFilterShot(dataUrl)
    onDone()
  }, [onDone, setFilterShot])

  // Countdown — only starts once camera is up so users aren't auto-shuttered into a blank shot.
  useEffect(() => {
    if (!cameraReady) return undefined
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id)
          takeShot()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [cameraReady, takeShot])

  const progress = countdown / COUNTDOWN_SEC
  const fatal = !!cameraError // model error is non-fatal
  const showOverlay = !cameraReady || fatal

  return (
    <Page>
      <Stage>
        <TopBar>
          <div>
            <Title>AR 필터 촬영</Title>
            <Status>
              {cameraError
                ? `에러: ${cameraError}`
                : modelError && cameraReady
                  ? modelError
                  : statusLabel}
            </Status>
          </div>
          <RingWrap>
            <Ring viewBox="0 0 64 64">
              <circle cx="32" cy="32" r={RING_R} stroke="#F0E2C4" strokeWidth="6" fill="none" />
              <circle
                cx="32"
                cy="32"
                r={RING_R}
                stroke={countdown <= 5 ? '#C44545' : '#463C3C'}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.2s' }}
              />
            </Ring>
            <RingCount $warn={countdown <= 5}>{countdown}</RingCount>
          </RingWrap>
        </TopBar>

        <CamWrap>
          <CamInner>
            <Video ref={videoRef} autoPlay muted playsInline />
            <Overlay ref={overlayRef} />
          </CamInner>
          {showOverlay && (
            <StatusOverlay $error={fatal}>
              {!fatal && <div className="spin" />}
              <div className="label">{fatal ? `에러: ${cameraError}` : statusLabel}</div>
              {statusDetail && !fatal && <div className="detail">{statusDetail}</div>}
              {fatal && <RetryBtn type="button" onClick={onRetry}>다시 시도</RetryBtn>}
            </StatusOverlay>
          )}
          <RoughFrame color="#856B6B" rx={24} seed={2} strokeWidth={3} scale={5} />
        </CamWrap>

        <FilterRow>
          {FILTERS.map((f) => (
            <Chip
              key={f.id}
              type="button"
              $active={filter === f.id}
              onClick={() => setFilter(f.id)}
              disabled={!modelReady && f.id !== 'none'}
            >
              <span className="emoji">{f.emoji}</span>
              {f.label}
            </Chip>
          ))}
        </FilterRow>

        <Shutter type="button" onClick={takeShot} disabled={!cameraReady}>● 지금 찍기</Shutter>
      </Stage>
    </Page>
  )
}

export default function FilterPage({ onDone }) {
  const [retryKey, setRetryKey] = useState(0)
  return <FilterPageInner key={retryKey} onRetry={() => setRetryKey((k) => k + 1)} onDone={onDone} />
}
