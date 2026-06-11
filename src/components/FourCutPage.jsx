import { useCallback, useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useGameSession } from '../context/gameSession'
import { composeFourCut } from '../utils/composeFourCut'
import { uploadPhoto, sendEmail } from '../api/shareApi'
import tape from '../assets/tape.svg'

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #FFFDF2;
  padding: clamp(18px, 4vw, 42px);
  box-sizing: border-box;
  overflow: hidden;
`

const Stage = styled.div`
  width: min(100%, 980px);
  min-height: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(280px, auto);
  align-items: center;
  gap: clamp(14px, 2.8vw, 30px);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    align-items: start;
    justify-items: center;
  }
`

const PreviewPane = styled.section`
  display: grid;
  justify-items: center;
  gap: 14px;
  order: 2;

  @media (max-width: 760px) {
    order: 1;
  }
`

const ControlPane = styled.section`
  width: min(100%, 460px);
  display: grid;
  gap: 20px;
  order: 1;

  @media (max-width: 760px) {
    order: 2;
  }
`

const Heading = styled.h1`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(34px, 5vw, 54px);
  color: #463C3C;
  margin: 0;
  letter-spacing: -0.01em;
`

const SubLine = styled.p`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  color: #856B6B;
  font-size: clamp(12px, 1.4vw, 14px);
  margin: -10px 0 0;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`

const Header = styled.div`
  display: grid;
  gap: 4px;

  @media (max-width: 760px) {
    text-align: center;
  }
`

const PreviewWrap = styled.div`
  --frame-scale: 0.34825;
  --preview-h: min(74vh, calc((100vw - 32px) / var(--frame-scale)), 860px);
  position: relative;
  width: calc(var(--preview-h) * var(--frame-scale));
  height: var(--preview-h);
  max-width: 100%;
  aspect-ratio: 1906 / 5473;
`

const PreviewInner = styled.div`
  position: absolute;
  inset: 0;
  background: transparent;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #B6A89A;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  z-index: 1;

  img { width: 100%; height: 100%; object-fit: contain; background: transparent; }
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
  display: grid;
  gap: 12px;
  width: 100%;
`

const ThumbnailLabel = styled.p`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  color: #856B6B;
  font-size: clamp(12px, 1.25vw, 14px);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0;
`

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
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
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: 11px;
`

const ChangeBtn = styled.button`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 0;
  background: rgba(0, 0, 0, 0.55);
  color: #FFFDF2;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: 11px;
  border: none;
  cursor: pointer;
  letter-spacing: 0.06em;

  &:hover { background: rgba(70, 60, 60, 0.8); }
`

const NextAction = styled.div`
  width: 100%;
  display: grid;
  padding-top: 4px;
`

const Btn = styled.button`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(15px, 1.6vw, 17px);
  font-weight: 800;
  border-radius: 12px;
  min-height: 56px;
  padding: 0 18px;
  cursor: pointer;
  border: none;
  transition: transform 0.12s ease, box-shadow 0.12s ease;

  &.primary {
    background: #463C3C;
    color: #FFFDF2;
    box-shadow: 0 4px 0 #1F1717, 0 10px 16px rgba(70, 60, 60, 0.16);
  }
  &.secondary {
    background: #fff;
    color: #463C3C;
    border: 1.5px solid rgba(133, 107, 107, 0.22);
    box-shadow: 0 4px 0 #e7ddd1;
  }
  &:active {
    transform: translateY(2px);
    box-shadow: none;
  }
  &.secondary:active {
    box-shadow: none;
  }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

const WideBtn = styled(Btn)`
  grid-column: 1 / -1;
`

/* ── 공유 섹션 ── */
const ShareSection = styled.div`
  display: grid;
  gap: 14px;
  width: 100%;
  padding-top: 16px;
  border-top: 1.5px solid rgba(133, 107, 107, 0.16);
`

const ShareLabel = styled.p`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(15px, 1.5vw, 17px);
  font-weight: 900;
  color: #463C3C;
  margin: 0;
`

const spin = keyframes`to { transform: rotate(360deg); }`

const Spinner = styled.div`
  width: 26px;
  height: 26px;
  border: 3px solid rgba(133, 107, 107, 0.2);
  border-top-color: #856b6b;
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
`

const QRRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
`

const QRBox = styled.div`
  flex-shrink: 0;
  width: clamp(104px, 15vw, 128px);
  aspect-ratio: 1;
  border-radius: 10px;
  background: #fff;
  border: 1.5px solid #e5dfd3;
  display: grid;
  place-items: center;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: contain; display: block; }
`

const QRInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const QRText = styled.p`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(14px, 1.4vw, 16px);
  font-weight: 800;
  color: #463C3C;
  margin: 0;
`

const QRSub = styled.p`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: 12px;
  color: #856b6b;
  margin: 0;
`

const ErrMsg = styled.p`
  font-size: 11px;
  color: #c44545;
  margin: 0;
`

const EmailForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`

const EmailInput = styled.input`
  width: 100%;
  min-height: 50px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid rgba(133, 107, 107, 0.35);
  background: #fff;
  font-family: inherit;
  font-size: 15px;
  color: #463c3c;
  box-sizing: border-box;

  &:focus { outline: none; border-color: #856b6b; }
  &:disabled { background: #f5f0e8; }
`

const SendBtn = styled.button`
  min-height: 50px;
  border-radius: 12px;
  padding: 12px;
  border: none;
  background: #463C3C;
  color: #FFFDF2;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.1s;
  width: 100%;

  &:active { transform: translateY(2px); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

const StatusMsg = styled.p`
  font-size: 12px;
  text-align: center;
  margin: 0;
  color: ${({ $ok }) => ($ok ? '#2e7d32' : '#c44545')};
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
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
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

    const videoEl = videoRef.current
    return () => {
      cancelled = true
      if (stream) stream.getTracks().forEach((t) => t.stop())
      if (videoEl) videoEl.srcObject = null
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
            <div style={{ padding: 24, color: '#FFFDF2', fontFamily: "'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif", textAlign: 'center' }}>
              {error}
            </div>
          )
          : <ModalVideo ref={videoRef} autoPlay muted playsInline />
        }
        <ModalActions>
          <ModalBtn style={{ background: '#F8E9C8', color: '#463C3C' }} onClick={onCancel}>
            취소
          </ModalBtn>
          <ModalBtn
            style={{ background: '#463C3C', color: '#FFFDF2' }}
            onClick={capture}
            disabled={!ready || !!error}
          >
            📸 찍기
          </ModalBtn>
        </ModalActions>
      </ModalBox>
    </ModalOverlay>
  )
}

// --- Main component ---

export default function FourCutPage({ onNext }) {
  const { result, failShots, updateFailShot } = useGameSession()
  const lifeFourCut = result?.lifeFourCut
  const failShotKey = (failShots ?? []).join('|')

  const [slots, setSlots] = useState(() => [...(failShots ?? [null, null, null, null])])
  const slotKey = slots.join('|')
  const hasSlotShots = slots.some(Boolean)
  const shouldUseServerFourCut = !!lifeFourCut && !hasSlotShots
  const [composed, setComposed] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [retakeIndex, setRetakeIndex] = useState(null)

  const [imageId, setImageId] = useState(null)
  const [qrB64, setQrB64] = useState(null)
  const [uploadErr, setUploadErr] = useState(null)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState(null)
  const uploadedRef = useRef(false)

  // Sync slots if failShots arrives after mount (e.g. context update)
  useEffect(() => {
    if (!dirty) {
      setSlots([...(failShots ?? [null, null, null, null])])
      setLoaded(false)
      setComposed(null)
      uploadedRef.current = false
      setImageId(null)
      setQrB64(null)
      setUploadErr(null)
    }
  }, [dirty, failShotKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initial composition — server image takes priority
  useEffect(() => {
    if (dirty) return
    if (shouldUseServerFourCut) {
      uploadedRef.current = false
      setImageId(null)
      setQrB64(null)
      setUploadErr(null)
      setComposed(lifeFourCut)
      setLoaded(true)
      return
    }
    let cancelled = false
    setLoaded(false)
    uploadedRef.current = false
    setImageId(null)
    setQrB64(null)
    setUploadErr(null)
    composeFourCut(slots).then((url) => {
      if (!cancelled) { setComposed(url); setLoaded(true) }
    })
    return () => { cancelled = true }
  }, [lifeFourCut, shouldUseServerFourCut, dirty, slots])

  // Recompose on the frontend after any slot is edited
  useEffect(() => {
    if (!dirty) return
    let cancelled = false
    setLoaded(false)
    uploadedRef.current = false
    setImageId(null)
    setQrB64(null)
    setUploadErr(null)
    composeFourCut(slots).then((url) => {
      if (!cancelled) { setComposed(url); setLoaded(true) }
    })
    return () => { cancelled = true }
  }, [dirty, slots])

  // Upload composed image to get QR
  useEffect(() => {
    if (!shouldUseServerFourCut && !hasSlotShots) return
    if (!composed || !loaded || uploadedRef.current) return
    uploadedRef.current = true
    uploadPhoto(composed)
      .then((res) => { setImageId(res.image_id); setQrB64(res.qr_b64) })
      .catch((err) => setUploadErr(err.message))
  }, [composed, loaded, shouldUseServerFourCut, hasSlotShots, slotKey])

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

  const hasShots = shouldUseServerFourCut || hasSlotShots

  const handleSendEmail = async (e) => {
    e.preventDefault()
    if (!email.trim() || !imageId) return
    setSending(true)
    setSendStatus(null)
    try {
      await sendEmail(email.trim(), imageId)
      setSendStatus({ ok: true, msg: '메일을 전송했습니다!' })
      setEmail('')
    } catch (err) {
      setSendStatus({ ok: false, msg: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <Page>
      {retakeIndex !== null && (
        <RetakeModal onCapture={handleCapture} onCancel={() => setRetakeIndex(null)} />
      )}

      <Stage>
        <PreviewPane>
          <PreviewWrap>
            <TapeTop src={tape} alt="" />
            <PreviewInner>
              {!loaded
                ? '합성 중...'
                : composed && hasShots
                  ? <img src={composed} alt="인생네컷" />
                  : '캡처된 사진이 없어요'}
            </PreviewInner>
            <TapeCorner $side="left" src={tape} alt="" />
            <TapeCorner $side="right" src={tape} alt="" />
          </PreviewWrap>
        </PreviewPane>

        <ControlPane>
          <Header>
            <Heading>인생네컷</Heading>
            <SubLine>Pwee · Photo Booth</SubLine>
          </Header>

          <ThumbnailSection>
            <ThumbnailLabel>사진 확인 및 수정</ThumbnailLabel>
            <ThumbnailGrid>
              {slots.map((slot, i) => (
                <ThumbnailSlot key={i}>
                  {slot
                    ? <img src={slot} alt={`사진 ${i + 1}`} />
                    : <SlotPlaceholder>#{i + 1}</SlotPlaceholder>
                  }
                  <ChangeBtn type="button" onClick={() => setRetakeIndex(i)}>
                    수정
                  </ChangeBtn>
                </ThumbnailSlot>
              ))}
            </ThumbnailGrid>
          </ThumbnailSection>

          {hasShots && (
            <ShareSection>
              <ShareLabel>공유하기</ShareLabel>

              <QRRow>
                <QRBox>
                  {uploadErr
                    ? <ErrMsg style={{ fontSize: 9, textAlign: 'center', padding: 4 }}>오류</ErrMsg>
                    : qrB64
                      ? <img src={`data:image/png;base64,${qrB64}`} alt="QR" />
                      : <Spinner />
                  }
                </QRBox>
                <QRInfo>
                  <QRText>QR 스캔</QRText>
                  <QRSub>카메라로 스캔하면 사진을 다운로드해요</QRSub>
                  {uploadErr && <ErrMsg>{uploadErr}</ErrMsg>}
                </QRInfo>
              </QRRow>

              <EmailForm onSubmit={handleSendEmail}>
                <EmailInput
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={sending || !imageId}
                />
                {sendStatus && <StatusMsg $ok={sendStatus.ok}>{sendStatus.msg}</StatusMsg>}
                <SendBtn type="submit" disabled={sending || !email.trim() || !imageId}>
                  {sending ? '전송 중...' : '이메일로 전송'}
                </SendBtn>
              </EmailForm>
            </ShareSection>
          )}

          {onNext && (
            <NextAction>
              <WideBtn type="button" className="primary" onClick={onNext}>
                다음으로
              </WideBtn>
            </NextAction>
          )}
        </ControlPane>
      </Stage>
    </Page>
  )
}
