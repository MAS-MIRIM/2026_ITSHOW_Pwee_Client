import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useGameSession } from '../context/gameSession'
import { uploadPhoto, sendEmail as apiSendEmail } from '../api/shareApi'

/* ── design tokens ──────────────────────────────────────────── */
const C = {
  paper:      '#faf7f0',
  card:       '#fffdf8',
  butterDeep: '#ecc057',
  ink:        '#3a2e24',
  inkSoft:    '#6f5d49',
  inkFaint:   '#a3927c',
  line2:      '#e0d3ba',
  coral:      '#df8a5f',
  good:       '#8ba06a',
}
const MONO  = "'Space Mono', ui-monospace, monospace"
const LOGO  = "'Space Grotesk', 'Pretendard', sans-serif"
const SERIF = "'Gowun Batang', 'Noto Serif KR', Georgia, serif"
const UI    = "'Pretendard', 'Apple SD Gothic Neo', sans-serif"

/* ── SVG marks ──────────────────────────────────────────────── */
function Bunny({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block' }}>
      <ellipse cx="18" cy="13" rx="4.6" ry="11" fill="#fff" stroke={C.ink} strokeWidth="1.6" />
      <ellipse cx="30" cy="13" rx="4.6" ry="11" fill="#fff" stroke={C.ink} strokeWidth="1.6" />
      <ellipse cx="18" cy="14" rx="1.8" ry="6" fill="#f0b89a" opacity=".7" />
      <ellipse cx="30" cy="14" rx="1.8" ry="6" fill="#f0b89a" opacity=".7" />
      <circle  cx="24"   cy="30"   r="13"  fill="#fff"  stroke={C.ink} strokeWidth="1.6" />
      <circle  cx="19.5" cy="29"   r="1.7" fill={C.ink} />
      <circle  cx="28.5" cy="29"   r="1.7" fill={C.ink} />
      <circle  cx="17"   cy="33.5" r="2.5" fill="#f0b89a" opacity=".75" />
      <circle  cx="31"   cy="33.5" r="2.5" fill="#f0b89a" opacity=".75" />
      <circle  cx="24"   cy="33"   r="1.5" fill="#f0b89a" />
    </svg>
  )
}

function Paw({ size = 28, opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'block', opacity }}>
      <ellipse cx="20" cy="26" rx="11"  ry="9"   fill={C.coral} />
      <ellipse cx="9"  cy="16" rx="3.6" ry="5"   fill={C.coral} />
      <ellipse cx="16" cy="10" rx="3.8" ry="5.4" fill={C.coral} />
      <ellipse cx="24" cy="10" rx="3.8" ry="5.4" fill={C.coral} />
      <ellipse cx="31" cy="16" rx="3.6" ry="5"   fill={C.coral} />
    </svg>
  )
}

/* ── PweeStrip ──────────────────────────────────────────────── */
const StripWrap = styled.div`
  position: relative;
  background: linear-gradient(168deg, #f7e1a0, #f4d27a 55%, #ecc057);
  border-radius: 20px;
  padding: 13px 13px 0;
  box-shadow: 0 2px 3px rgba(58,46,36,.10), 0 30px 50px -26px rgba(120,90,30,.6);
`
const Tape = styled.span`
  position: absolute;
  z-index: 4;
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.18) 0 5px, rgba(255,255,255,.05) 5px 10px),
    rgba(247,233,193,.72);
  box-shadow: 0 2px 6px rgba(58,46,36,.12);
  border-left:  1px dashed rgba(120,90,30,.22);
  border-right: 1px dashed rgba(120,90,30,.22);
`
const StripPhotos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`
const StripCell = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 7px;
  background: ${({ $src }) => $src
    ? `url(${$src}) center/cover no-repeat`
    : 'repeating-linear-gradient(135deg, #efe6d4 0 9px, #e8ddc7 9px 18px)'};
`
const CellLens = styled.span`
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 34px; height: 34px;
  border-radius: 50%;
  border: 2px solid rgba(58,46,36,.16);

  &::after {
    content: '';
    position: absolute;
    inset: 9px;
    border-radius: 50%;
    background: rgba(58,46,36,.10);
  }
`
const CellIdx = styled.span`
  position: absolute;
  right: 7px; bottom: 6px;
  font-family: ${MONO};
  font-size: 10px;
  color: ${({ $hasSrc }) => $hasSrc ? 'rgba(255,255,255,.5)' : 'rgba(58,46,36,.32)'};
`
const StripFoot = styled.div`
  text-align: center;
  padding: 13px 0 16px;
  position: relative;
`
const StripWord = styled.div`
  font-family: ${LOGO};
  font-weight: 700;
  font-size: 18px;
  letter-spacing: .02em;
  color: #6c5326;
`
const StripDate = styled.div`
  font-family: ${MONO};
  font-size: 10px;
  letter-spacing: .18em;
  color: #97712f;
  margin-top: 3px;
`
const StripBunny = styled.span`
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%) rotate(-12deg);
`
const StripPawWrap = styled.span`
  position: absolute;
  right: 14px;
  bottom: 8px;
`

function PweeStrip({ shots = [], cellH = 130, width = 226 }) {
  const date = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }, [])
  const cells = [0, 1, 2, 3].map(i => shots[i] ?? null)

  return (
    <StripWrap style={{ width }}>
      <Tape style={{ top: -13, left: width * .28, width: width * .44, height: 26, transform: 'rotate(-3deg)' }} />
      <Tape style={{ bottom: -11, right: width * .24, width: width * .4, height: 24, transform: 'rotate(4deg)' }} />
      <StripPhotos>
        {cells.map((src, i) => (
          <StripCell key={i} $src={src} style={{ height: cellH }}>
            {!src && <CellLens />}
            <CellIdx $hasSrc={!!src}>{String(i + 1).padStart(2, '0')}</CellIdx>
          </StripCell>
        ))}
      </StripPhotos>
      <StripFoot>
        <StripWord>PWEE</StripWord>
        <StripDate>{date}</StripDate>
        <StripPawWrap><Paw size={24} opacity={.9} /></StripPawWrap>
      </StripFoot>
      <StripBunny><Bunny size={40} /></StripBunny>
    </StripWrap>
  )
}

/* ── Chrome header ──────────────────────────────────────────── */
const ChromeWrap = styled.header`
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26px 48px 0;
  flex-shrink: 0;
`
const LogoWrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 12px;
`
const LogoWord = styled.span`
  font-family: ${LOGO};
  font-weight: 700;
  font-size: 22px;
  color: ${C.ink};
`
const ChromeMid = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`
const StepLabel = styled.span`
  font-family: ${MONO};
  font-size: 12px;
  letter-spacing: .14em;
  color: ${C.inkFaint};
  text-transform: uppercase;
`
const StepTrack = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
`
const StepDot = styled.span`
  width:  ${({ $active }) => $active ? '30px' : '9px'};
  height: 9px;
  border-radius: ${({ $active }) => $active ? '6px' : '50%'};
  background: ${({ $active, $done }) => $active ? C.ink : $done ? C.butterDeep : C.line2};
  transition: all .2s;
`
const ChromeHelpBtn = styled.div`
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid ${C.line2};
  background: ${C.card};
  display: grid;
  place-items: center;
  color: ${C.inkSoft};
`

const STEPS = ['촬영 준비', '프레임', '촬영', '컷 선택', '꾸미기', '공유']

function Chrome() {
  return (
    <ChromeWrap>
      <LogoWrap>
        <Bunny size={30} />
        <LogoWord>PWEE</LogoWord>
      </LogoWrap>
      <ChromeMid>
        <StepLabel>Step 6 / 6</StepLabel>
        <StepTrack>
          {STEPS.map((_, i) => (
            <StepDot key={i} $active={i === 5} $done={i < 5} />
          ))}
        </StepTrack>
      </ChromeMid>
      <ChromeHelpBtn aria-hidden>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M8 5v4M8 11h.01M8 1.5 1.5 13h13L8 1.5Z" />
        </svg>
      </ChromeHelpBtn>
    </ChromeWrap>
  )
}

/* ── Page shell ─────────────────────────────────────────────── */
const Page = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, #fbf3df 0%, ${C.paper} 46%);
  color: ${C.ink};
  font-family: ${UI};
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(440px 320px at 88% -8%,  rgba(244,210,122,.20), transparent 70%),
      radial-gradient(520px 360px at -6% 108%, rgba(223,138,95,.07),  transparent 72%);
  }
`
const Body = styled.div`
  flex: 1;
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 56px;
  padding: 0 64px;
  align-items: center;
  min-height: 0;

  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    padding: 24px 32px 40px;
    align-items: start;
    overflow-y: auto;
  }
`

/* ── Left — hero ─────────────────────────────────────────────── */
const HeroCol = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  min-width: 0;
`
const HeroText = styled.div`
  min-width: 0;
`
const Eyebrow = styled.div`
  font-family: ${MONO};
  font-size: 12px;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: ${C.inkFaint};
  margin-bottom: 10px;
`
const HeroTitle = styled.div`
  font-family: ${SERIF};
  font-weight: 700;
  font-size: clamp(30px, 3.6vw, 46px);
  line-height: 1.22;
  color: ${C.ink};
  white-space: nowrap;
  margin-bottom: 14px;
`
const HeroDesc = styled.p`
  font-size: 15px;
  color: ${C.inkSoft};
  max-width: 240px;
  line-height: 1.55;
  margin: 0;
`

/* ── Receipt card ────────────────────────────────────────────── */
const ReceiptOuter = styled.div`
  filter: drop-shadow(0 20px 34px rgba(58,46,36,.22));
  justify-self: center;
`
const Receipt = styled.div`
  width: 372px;
  background: ${C.card};
  padding: 32px 32px 28px;
  border-radius: 8px;
  mask-image:
    radial-gradient(circle 15px at 0 100%,   transparent 14px, #000 14.5px),
    radial-gradient(circle 15px at 100% 100%, transparent 14px, #000 14.5px);
  -webkit-mask-image:
    radial-gradient(circle 15px at 0 100%,   transparent 14px, #000 14.5px),
    radial-gradient(circle 15px at 100% 100%, transparent 14px, #000 14.5px);
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
`
const RHead = styled.div`
  text-align: center;
  margin-bottom: 16px;
`
const RWordmark = styled.div`
  font-family: ${LOGO};
  font-weight: 700;
  font-size: 25px;
  letter-spacing: .14em;
  color: ${C.ink};
`
const RSub = styled.div`
  font-family: ${MONO};
  font-size: 11px;
  letter-spacing: .24em;
  color: ${C.inkFaint};
  margin-top: 2px;
`
const Dash = styled.div`
  height: 0;
  border-top: 1.5px dashed ${C.line2};
  margin: 13px 0;
`
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${MONO};
  font-size: 13px;
  padding: 4px 0;
`
const RKey = styled.span` color: ${C.inkSoft}; `
const RVal = styled.span` color: ${C.ink}; `

const spinKf = keyframes`to { transform: rotate(360deg); }`
const Spinner = styled.div`
  width: 48px; height: 48px;
  border: 3px solid rgba(58,46,36,.12);
  border-top-color: ${C.inkFaint};
  border-radius: 50%;
  animation: ${spinKf} .9s linear infinite;
`

const QRZone = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;
`
const QRBox = styled.div`
  flex-shrink: 0;
  width: 104px; height: 104px;
  border-radius: 10px;
  background: #fff;
  display: grid;
  place-items: center;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: contain; display: block; }
`
const QRNow = styled.div`
  font-family: ${MONO};
  font-size: 11px;
  letter-spacing: .18em;
  color: ${C.inkFaint};
  margin-bottom: 5px;
`
const QRTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  color: ${C.ink};
`
const OrLabel = styled.div`
  font-family: ${MONO};
  font-size: 11px;
  letter-spacing: .18em;
  color: ${C.inkFaint};
  margin-bottom: 9px;
`
const EmailGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid ${({ $error }) => $error ? C.coral : C.line2};
  border-radius: 12px;
  padding: 4px 4px 4px 14px;
  background: ${C.paper};
  transition: border-color .15s;

  &:focus-within {
    border-color: ${({ $error }) => $error ? C.coral : C.ink};
  }
`
const EmailInput = styled.input`
  border: none;
  background: transparent;
  padding: 11px 0;
  font-size: 14px;
  font-family: ${UI};
  color: ${C.ink};
  flex: 1;
  min-width: 0;
  outline: none;

  &::placeholder { color: ${C.inkFaint}; }
`
const SendBtn = styled.button`
  background: ${C.ink};
  color: #fdf7ea;
  border: none;
  border-radius: 9px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 700;
  font-family: ${UI};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform .12s, filter .15s;

  &:hover:not(:disabled) { filter: brightness(1.14); }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: .45; cursor: not-allowed; }
`
const Hint = styled.p`
  font-size: 11px;
  color: ${({ $ok }) => $ok ? C.good : C.coral};
  margin: 6px 0 0;
  font-family: ${UI};
`
const RFoot = styled.div`
  text-align: center;
  font-family: ${MONO};
  font-size: 11.5px;
  letter-spacing: .1em;
  color: ${C.inkSoft};
`

/* ── Done screen ─────────────────────────────────────────────── */
const DonePage = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, #fbf3df 0%, ${C.paper} 46%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-family: ${UI};
  color: ${C.ink};
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(440px 320px at 88% -8%,  rgba(244,210,122,.20), transparent 70%),
      radial-gradient(520px 360px at -6% 108%, rgba(223,138,95,.07),  transparent 72%);
  }
`
const CheckBadge = styled.div`
  position: relative; z-index: 1;
  width: 80px; height: 80px;
  border-radius: 50%;
  background: ${C.good};
  display: grid;
  place-items: center;
`
const DoneTitle = styled.h2`
  position: relative; z-index: 1;
  font-size: 28px;
  font-weight: 800;
  margin: 4px 0 0;
  text-align: center;
`
const DoneSub = styled.p`
  position: relative; z-index: 1;
  font-size: 15px;
  color: ${C.inkSoft};
  text-align: center;
  margin: 0;
`
const HomeBtn = styled.button`
  position: relative; z-index: 1;
  background: ${C.ink};
  color: #fdf7ea;
  border: none;
  border-radius: 999px;
  padding: 16px 36px;
  font-size: 16px;
  font-weight: 700;
  font-family: ${UI};
  cursor: pointer;
  margin-top: 8px;
  transition: transform .12s, filter .15s;

  &:hover { filter: brightness(1.14); }
  &:active { transform: translateY(2px); }
`

function ScreenDone({ email, onHome }) {
  const [tick, setTick] = useState(10)

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => {
        if (t <= 1) { clearInterval(id); onHome(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [onHome])

  return (
    <DonePage>
      <CheckBadge>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
             stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </CheckBadge>
      <DoneTitle>이메일로 전송했어요</DoneTitle>
      <DoneSub>{email} 로 사진이 전송되었습니다.</DoneSub>
      <HomeBtn onClick={onHome}>처음으로 · {tick}s</HomeBtn>
    </DonePage>
  )
}

/* ── Main ────────────────────────────────────────────────────── */
export function SharePage({ onRestart }) {
  const { filterShot, shareImage, videoGameId, failShots } = useGameSession()
  const imageToShare = shareImage ?? filterShot

  const [imageId,   setImageId]   = useState(null)
  const [qrB64,     setQrB64]     = useState(null)
  const [uploadErr, setUploadErr] = useState(null)

  const [email,      setEmail]      = useState('')
  const [emailError, setEmailError] = useState(null)
  const [status,     setStatus]     = useState('idle') // idle | sending | sent | error
  const [sendErr,    setSendErr]    = useState(null)

  const uploadedRef = useRef(false)

  const nowStr = useMemo(() => {
    const d = new Date()
    const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    return `${date}  ${time}`
  }, [])

  useEffect(() => {
    if (!imageToShare || uploadedRef.current) return
    uploadedRef.current = true
    uploadPhoto(imageToShare, videoGameId)
      .then(res => { setImageId(res.image_id); setQrB64(res.qr_b64) })
      .catch(err => setUploadErr(err.message))
  }, [imageToShare, videoGameId])

  const handleSend = useCallback(async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('올바른 이메일 주소를 입력해주세요')
      return
    }
    setEmailError(null)
    setSendErr(null)
    setStatus('sending')
    try {
      await apiSendEmail(trimmed, imageId, videoGameId)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setSendErr(err.message)
    }
  }, [email, imageId, videoGameId, status])

  if (status === 'sent') {
    return <ScreenDone email={email.trim()} onHome={onRestart} />
  }

  return (
    <Page>
      <Chrome />
      <Body>
        {/* ── Left: strip + text ── */}
        <HeroCol>
          <div style={{ transform: 'rotate(-4deg)', flexShrink: 0 }}>
            <PweeStrip shots={failShots ?? []} cellH={130} width={226} />
          </div>
          <HeroText>
            <Eyebrow>완성!</Eyebrow>
            <HeroTitle>오늘의<br />네 컷 영수증</HeroTitle>
            <HeroDesc>QR로 지금 바로 저장하고,<br />이메일로도 한 부 받아두세요.</HeroDesc>
          </HeroText>
        </HeroCol>

        {/* ── Right: receipt card ── */}
        <ReceiptOuter>
          <Receipt>
            <RHead>
              <RWordmark>PWEE</RWordmark>
              <RSub>PHOTO BOOTH · RECEIPT</RSub>
            </RHead>

            <Dash />

            <Row><RKey>BOOTH</RKey><RVal>No. 01</RVal></Row>
            <Row><RKey>DATE</RKey><RVal>{nowStr}</RVal></Row>

            <Dash />

            <QRZone>
              <QRBox>
                {uploadErr
                  ? <span style={{ fontSize: 10, color: C.coral, textAlign: 'center', padding: 4 }}>오류</span>
                  : qrB64
                    ? <img src={`data:image/png;base64,${qrB64}`} alt="QR 코드" />
                    : <Spinner />
                }
              </QRBox>
              <div>
                <QRNow>NOW</QRNow>
                <QRTitle>QR 스캔으로<br />즉시 저장</QRTitle>
              </div>
            </QRZone>

            <Dash style={{ margin: '15px 0 13px' }} />

            <OrLabel>OR · KEEP A COPY</OrLabel>

            <form onSubmit={handleSend}>
              <EmailGroup $error={!!emailError}>
                <EmailInput
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(null); setSendErr(null) }}
                  disabled={status === 'sending' || !imageId}
                />
                <SendBtn
                  type="submit"
                  disabled={status === 'sending' || !imageId}
                >
                  {status === 'sending' ? '전송 중' : '전송'}
                </SendBtn>
              </EmailGroup>
              {emailError && <Hint>{emailError}</Hint>}
              {status === 'error' && sendErr && <Hint>{sendErr}</Hint>}
            </form>

            <Dash />

            <RFoot>THANK YOU · SEE YOU AGAIN ♡</RFoot>
          </Receipt>
        </ReceiptOuter>
      </Body>
    </Page>
  )
}
