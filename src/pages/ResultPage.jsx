import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useGameSession } from '../context/gameSession'
import { uploadPhoto, sendEmail } from '../api/shareApi'

/* ── 레이아웃 ── */
const Section = styled.section`
  min-height: inherit;
  display: grid;
  place-items: center;
  padding: clamp(20px, 4vw, 48px);
  box-sizing: border-box;
`

const Panel = styled.article`
  width: min(100%, 900px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(24px, 3vw, 48px);
  align-items: start;

  @media (max-width: 660px) {
    grid-template-columns: 1fr;
  }
`

/* ── 왼쪽: 결과 ── */
const Left = styled.div`
  display: grid;
  gap: 14px;
`

const Title = styled.h2`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(22px, 3vw, 30px);
  color: #463C3C;
  margin: 0;
`

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

const MetricBox = styled.div`
  padding: 14px;
  border-radius: 12px;
  background: rgba(133, 107, 107, 0.05);
  border: 1.5px solid rgba(133, 107, 107, 0.12);
  display: grid;
  gap: 4px;
`

const MetricLabel = styled.p`
  color: rgba(133, 107, 107, 0.8);
  font-size: 0.88rem;
  margin: 0;
`

const MetricValue = styled.strong`
  font-size: 1.45rem;
  color: #463C3C;
  line-height: 1.2;
`

const ActionsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
`

const Btn = styled.button`
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(13px, 1.4vw, 15px);
  width: 100%;
  text-align: center;
  transition: transform 0.1s;
  border: 2px solid #856b6b;

  &:active { transform: translateY(2px); }
  &:focus-visible { outline: 2px solid rgba(133,107,107,0.45); outline-offset: 2px; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

const SecondaryBtn = styled(Btn)`
  background: #fffdf2;
  color: #856b6b;
`

const PrimaryBtn = styled(Btn)`
  background: #856b6b;
  color: #fffdf2;
  border-color: #856b6b;
`

/* ── 오른쪽: 인생네컷 + 공유 ── */
const Right = styled.div`
  display: grid;
  gap: 16px;
`

const SectionLabel = styled.p`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(13px, 1.5vw, 15px);
  color: #463C3C;
  margin: 0;
  letter-spacing: 0.02em;
`

const FourCutPreview = styled.div`
  width: 100%;
  aspect-ratio: 720 / 1280;
  border-radius: 14px;
  overflow: hidden;
  background: #1F1A1A;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #B6A89A;
  font-family: Georgia, serif;
  font-size: 13px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #1F1A1A;
    display: block;
  }
`

const Divider = styled.div`
  height: 1px;
  background: rgba(133,107,107,0.15);
`

/* ── QR 코드 ── */
const spin = keyframes`to { transform: rotate(360deg); }`

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(133,107,107,0.2);
  border-top-color: #856b6b;
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
`

const QRRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`

const QRBox = styled.div`
  flex-shrink: 0;
  width: clamp(80px, 14vw, 110px);
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
  gap: 4px;
`

const QRLabel = styled.p`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(12px, 1.3vw, 14px);
  color: #463C3C;
  margin: 0;
`

const QRSub = styled.p`
  font-family: Georgia, serif;
  font-size: 11px;
  color: #856b6b;
  margin: 0;
  letter-spacing: 0.06em;
`

const ErrMsg = styled.p`
  font-size: 11px;
  color: #c44545;
  margin: 0;
`

/* ── 이메일 폼 ── */
const EmailForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const EmailInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid rgba(133,107,107,0.35);
  background: #fff;
  font-family: inherit;
  font-size: 14px;
  color: #463c3c;
  box-sizing: border-box;

  &:focus { outline: none; border-color: #856b6b; }
  &:disabled { background: #f5f0e8; }
`

const SendBtn = styled.button`
  border-radius: 10px;
  padding: 10px;
  border: none;
  background: #463C3C;
  color: #FFFDF2;
  font-family: 'Suez One', Georgia, serif;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.1s;

  &:active { transform: translateY(2px); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

const StatusMsg = styled.p`
  font-size: 12px;
  text-align: center;
  margin: 0;
  color: ${({ $ok }) => ($ok ? '#2e7d32' : '#c44545')};
`

/* ── 유틸 ── */
function formatTime(ms) {
  if (!ms) return '00:00.00'
  const totalSec = ms / 1000
  const min = Math.floor(totalSec / 60).toString().padStart(2, '0')
  const sec = (totalSec % 60).toFixed(2).padStart(5, '0')
  return `${min}:${sec}`
}

/* ── 컴포넌트 ── */
export function ResultPage({ mode, nickname, onHome, onRanking, onFourCut }) {
  const { result } = useGameSession()

  const timeDisplay = formatTime(result?.timeMs)
  const lifeFourCut = result?.lifeFourCut

  const primaryLabel = mode === 'multi' ? '최종 점수' : '총 소요 시간'
  const primaryValue =
    mode === 'multi'
      ? `${result?.score?.left ?? 0} : ${result?.score?.right ?? 0}`
      : timeDisplay

  const secondaryLabel = mode === 'multi' ? '승패 결과' : '소요 시간'
  const secondaryValue =
    mode === 'multi'
      ? (result?.score?.left ?? 0) > (result?.score?.right ?? 0)
        ? `${nickname || 'Player 1'} WIN`
        : (result?.score?.left ?? 0) < (result?.score?.right ?? 0)
          ? `${nickname || 'Player 1'} LOSE`
          : 'DRAW'
      : timeDisplay

  /* ── 공유 상태 ── */
  const [imageId, setImageId]       = useState(null)
  const [qrB64, setQrB64]           = useState(null)
  const [uploadErr, setUploadErr]   = useState(null)
  const [email, setEmail]           = useState('')
  const [sending, setSending]       = useState(false)
  const [sendStatus, setSendStatus] = useState(null)
  const uploadedRef = useRef(false)

  useEffect(() => {
    if (!lifeFourCut || uploadedRef.current) return
    uploadedRef.current = true
    uploadPhoto(lifeFourCut)
      .then((res) => { setImageId(res.image_id); setQrB64(res.qr_b64) })
      .catch((err) => setUploadErr(err.message))
  }, [lifeFourCut])

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
    <Section>
      <Panel>
        {/* 왼쪽: 결과 + 공유 */}
        <Left>
          <Title>게임 결과</Title>
          <MetricGrid>
            <MetricBox>
              <MetricLabel>{primaryLabel}</MetricLabel>
              <MetricValue>{primaryValue}</MetricValue>
            </MetricBox>
            <MetricBox>
              <MetricLabel>{secondaryLabel}</MetricLabel>
              <MetricValue>{secondaryValue}</MetricValue>
            </MetricBox>
          </MetricGrid>

          <ActionsCol>
            <SecondaryBtn type="button" onClick={onHome}>홈으로 가기</SecondaryBtn>
            <SecondaryBtn type="button" onClick={onRanking}>랭킹 보기</SecondaryBtn>
          </ActionsCol>

          {lifeFourCut && (
            <>
              <Divider />

              <SectionLabel>공유하기</SectionLabel>

            {/* QR 코드 */}
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
                <QRLabel>QR 스캔</QRLabel>
                <QRSub>카메라로 스캔하면{'\n'}사진을 다운로드해요</QRSub>
                {uploadErr && <ErrMsg>{uploadErr}</ErrMsg>}
              </QRInfo>
            </QRRow>

            {/* 이메일 */}
            <EmailForm onSubmit={handleSendEmail}>
              <EmailInput
                type="email"
                placeholder="이메일로 받기"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending || !imageId}
              />
              {sendStatus && <StatusMsg $ok={sendStatus.ok}>{sendStatus.msg}</StatusMsg>}
              <SendBtn type="submit" disabled={sending || !email.trim() || !imageId}>
                {sending ? '전송 중...' : '📧 이메일로 전송'}
              </SendBtn>
            </EmailForm>

            <PrimaryBtn type="button" onClick={onFourCut}>사진 찍기 →</PrimaryBtn>
            </>
          )}
        </Left>

        {/* 오른쪽: 인생네컷 미리보기 */}
        {lifeFourCut && (
          <Right>
            <SectionLabel>인생네컷</SectionLabel>
            <FourCutPreview>
              <img src={lifeFourCut} alt="인생네컷" />
            </FourCutPreview>
          </Right>
        )}
      </Panel>
    </Section>
  )
}
