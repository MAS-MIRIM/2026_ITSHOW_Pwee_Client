import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useGameSession } from '../context/gameSession'
import { composeFourCut } from '../utils/composeFourCut'
import { downloadDataUrl } from '../utils/downloadDataUrl'
import RoughFrame from './RoughFrame'
import tape from '../assets/tape.svg'

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #FFFDF2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 48px);
  box-sizing: border-box;
  overflow: auto;
`

const Stage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(16px, 2.4vw, 28px);
  position: relative;
`

const Heading = styled.h1`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(34px, 5vw, 54px);
  color: #463C3C;
  margin: 0;
  letter-spacing: -0.01em;
`

const SubLine = styled.p`
  font-family: Georgia, serif;
  color: #856B6B;
  font-size: clamp(12px, 1.4vw, 14px);
  margin: -10px 0 0;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`

const PreviewWrap = styled.div`
  position: relative;
  width: clamp(260px, 38vw, 380px);
  aspect-ratio: 720 / 1280;
`

const PreviewInner = styled.div`
  position: absolute;
  inset: 0;
  background: #1F1A1A;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #B6A89A;
  font-family: Georgia, serif;
  z-index: 1;

  img { width: 100%; height: 100%; object-fit: contain; background: #1F1A1A; }
`

const TapeTop = styled.img`
  position: absolute;
  width: clamp(80px, 12vw, 120px);
  top: -14px;
  left: 50%;
  transform: translateX(-50%) rotate(-4deg);
  z-index: 3;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,0.12));
`

const TapeCorner = styled.img`
  position: absolute;
  width: clamp(64px, 9vw, 90px);
  bottom: -10px;
  ${({ $side }) => ($side === 'left' ? 'left: -16px; transform: rotate(-26deg);' : 'right: -16px; transform: rotate(26deg);')}
  z-index: 3;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,0.12));
`

const ThumbnailSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: clamp(260px, 38vw, 380px);
`

const ThumbnailLabel = styled.p`
  font-family: Georgia, serif;
  color: #856B6B;
  font-size: clamp(11px, 1.2vw, 13px);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0;
`

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 100%;
`

const ThumbnailSlot = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  overflow: hidden;
  background: #1F1A1A;
  border: 1.5px solid rgba(133, 107, 107, 0.25);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const SlotPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5a4e4e;
  font-family: Georgia, serif;
  font-size: 11px;
`

const ChangeBtn = styled.button`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 0;
  background: rgba(0, 0, 0, 0.55);
  color: #FFFDF2;
  font-family: 'Suez One', Georgia, serif;
  font-size: 10px;
  border: none;
  cursor: pointer;
  letter-spacing: 0.06em;

  &:hover { background: rgba(70, 60, 60, 0.8); }
`

const Actions = styled.div`
  display: flex;
  gap: clamp(10px, 1.5vw, 18px);
  flex-wrap: wrap;
  justify-content: center;
`

const Btn = styled.button`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(14px, 1.6vw, 18px);
  border-radius: 999px;
  padding: 14px 28px;
  cursor: pointer;
  border: none;
  transition: transform 0.12s ease, box-shadow 0.12s ease;

  &.primary {
    background: #463C3C;
    color: #FFFDF2;
    box-shadow: 0 6px 0 #1F1717, 0 12px 18px rgba(70, 60, 60, 0.18);
  }
  &.secondary {
    background: #F8E9C8;
    color: #463C3C;
    box-shadow: 0 6px 0 #C9A861, 0 12px 18px rgba(133, 107, 107, 0.18);
  }
  &:active {
    transform: translateY(3px);
    box-shadow: 0 3px 0 #1F1717, 0 6px 10px rgba(70, 60, 60, 0.18);
  }
  &.secondary:active {
    box-shadow: 0 3px 0 #C9A861, 0 6px 10px rgba(133, 107, 107, 0.18);
  }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

// --- Retake Modal ---

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
`

const ModalBox = styled.div`
  background: #1F1A1A;
  border-radius: 20px;
  overflow: hidden;
  width: min(90vw, 420px);
  display: flex;
  flex-direction: column;
`

const ModalVideo = styled.video`
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transform: scaleX(-1);
  display: block;
  background: #000;
`

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
`

const ModalBtn = styled.button`
  flex: 1;
  border-radius: 12px;
  padding: 12px;
  border: none;
  font-family: 'Suez One', Georgia, serif;
  font-size: 15px;
  cursor: pointer;

  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

function RetakeModal({ onCapture, onCancel }) {
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let stream = null
    let cancelled = false

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        const v = videoRef.current
        if (!v) return
        v.srcObject = stream
        await v.play().catch(() => {})
        if (!cancelled) setReady(true)
      } catch (err) {
        if (!cancelled) setError(err?.message ?? '카메라를 사용할 수 없어요')
      }
    }
    start()

    return () => {
      cancelled = true
      if (stream) stream.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [])

  const capture = useCallback(() => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const c = document.createElement('canvas')
    c.width = v.videoWidth
    c.height = v.videoHeight
    const ctx = c.getContext('2d')
    ctx.save()
    ctx.translate(c.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(v, 0, 0)
    ctx.restore()
    onCapture(c.toDataURL('image/jpeg', 0.88))
  }, [onCapture])

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <ModalBox>
        {error
          ? (
            <div style={{ padding: 24, color: '#FFFDF2', fontFamily: 'Georgia, serif', textAlign: 'center' }}>
              {error}
            </div>
          )
          : <ModalVideo ref={videoRef} autoPlay muted playsInline />
        }
        <ModalActions>
          <ModalBtn
            style={{ background: '#463C3C', color: '#FFFDF2' }}
            onClick={capture}
            disabled={!ready || !!error}
          >
            📸 찍기
          </ModalBtn>
          <ModalBtn style={{ background: '#F8E9C8', color: '#463C3C' }} onClick={onCancel}>
            취소
          </ModalBtn>
        </ModalActions>
      </ModalBox>
    </ModalOverlay>
  )
}

// --- Main component ---

export default function FourCutPage({ onFilter }) {
  const { result, failShots, updateFailShot } = useGameSession()
  const lifeFourCut = result?.lifeFourCut

  const [slots, setSlots] = useState(() => [...(failShots ?? [null, null, null, null])])
  const [composed, setComposed] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [retakeIndex, setRetakeIndex] = useState(null)

  // Sync slots if failShots arrives after mount (e.g. context update)
  useEffect(() => {
    if (!dirty) {
      setSlots([...(failShots ?? [null, null, null, null])])
    }
  }, [failShots]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initial composition — server image takes priority
  useEffect(() => {
    if (dirty) return
    if (lifeFourCut) {
      setComposed(lifeFourCut)
      setLoaded(true)
      return
    }
    let cancelled = false
    composeFourCut(slots).then((url) => {
      if (!cancelled) { setComposed(url); setLoaded(true) }
    })
    return () => { cancelled = true }
  }, [lifeFourCut, dirty]) // eslint-disable-line react-hooks/exhaustive-deps

  // Recompose on the frontend after any slot is edited
  useEffect(() => {
    if (!dirty) return
    let cancelled = false
    setLoaded(false)
    composeFourCut(slots).then((url) => {
      if (!cancelled) { setComposed(url); setLoaded(true) }
    })
    return () => { cancelled = true }
  }, [dirty, slots])

  const handleCapture = useCallback((dataUrl) => {
    const idx = retakeIndex
    setRetakeIndex(null)
    setSlots((prev) => {
      const next = [...prev]
      next[idx] = dataUrl
      return next
    })
    updateFailShot(idx, dataUrl)
    setDirty(true)
  }, [retakeIndex, updateFailShot])

  const hasShots = lifeFourCut ? true : slots.some(Boolean)

  return (
    <Page>
      {retakeIndex !== null && (
        <RetakeModal onCapture={handleCapture} onCancel={() => setRetakeIndex(null)} />
      )}

      <Stage>
        <Heading>인생네컷</Heading>
        <SubLine>Pwee · Photo Booth</SubLine>

        <PreviewWrap>
          <TapeTop src={tape} alt="" />
          <PreviewInner>
            {!loaded
              ? '합성 중...'
              : composed && hasShots
                ? <img src={composed} alt="인생네컷" />
                : '캡처된 사진이 없어요'}
          </PreviewInner>
          <RoughFrame color="#856B6B" rx={18} seed={6} strokeWidth={3} />
          <TapeCorner $side="left" src={tape} alt="" />
          <TapeCorner $side="right" src={tape} alt="" />
        </PreviewWrap>

        <ThumbnailSection>
          <ThumbnailLabel>사진 변경</ThumbnailLabel>
          <ThumbnailGrid>
            {slots.map((slot, i) => (
              <ThumbnailSlot key={i}>
                {slot
                  ? <img src={slot} alt={`사진 ${i + 1}`} />
                  : <SlotPlaceholder>#{i + 1}</SlotPlaceholder>
                }
                <ChangeBtn type="button" onClick={() => setRetakeIndex(i)}>
                  변경
                </ChangeBtn>
              </ThumbnailSlot>
            ))}
          </ThumbnailGrid>
        </ThumbnailSection>

        <Actions>
          <Btn
            type="button"
            className="secondary"
            onClick={() => composed && downloadDataUrl(composed, 'pwee-fourcut.png')}
            disabled={!composed || !hasShots}
          >
            ⬇ 다운로드
          </Btn>
          <Btn type="button" className="primary" onClick={onFilter}>
            필터로 사진 찍기 →
          </Btn>
        </Actions>
      </Stage>
    </Page>
  )
}
