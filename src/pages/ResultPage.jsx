import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useGameSession } from '../context/gameSession'
import { uploadPhoto, sendEmail } from '../api/shareApi'

/* ── 진입 애니메이션 ── */
const popIn = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

const spin = keyframes`to { transform: rotate(360deg); }`

/* ── 레이아웃 ── */
const Section = styled.section`
  min-height: inherit;
  display: grid;
  place-items: center;
  padding: clamp(20px, 4vw, 48px);
  box-sizing: border-box;
`

const Panel = styled.article`
  width: min(100%, 920px);
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: clamp(20px, 3vw, 40px);
  align-items: stretch;
  padding: clamp(20px, 3.2vw, 36px);
  border-radius: clamp(20px, 3vw, 28px);
  background: #fff;
  border: 2px solid rgba(133, 107, 107, 0.18);
  box-shadow: 0 18px 40px rgba(133, 107, 107, 0.16);
  animation: ${popIn} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;

  @media (max-width: 660px) {
    grid-template-columns: 1fr;
  }
`

/* ── 왼쪽: 결과 ── */
const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Title = styled.h2`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(24px, 3.2vw, 32px);
  color: #463c3c;
  margin: 0;
`

/* ── 결과 히어로 ── */
const ResultCard = styled.div`
  border-radius: 18px;
  padding: clamp(16px, 2.4vw, 24px);
  background: ${({ $win }) =>
    $win ? 'rgba(133, 107, 107, 0.09)' : 'rgba(133, 107, 107, 0.05)'};
  border: 1.5px solid rgba(133, 107, 107, 0.16);
  display: grid;
  gap: 6px;
  justify-items: center;
  text-align: center;
`

const Outcome = styled.strong`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(28px, 5vw, 42px);
  line-height: 1.05;
  color: #856b6b;
  letter-spacing: 0.02em;
`

const HeroValue = styled.strong`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(34px, 6vw, 52px);
  line-height: 1.1;
  color: #463c3c;
`

const HeroCaption = styled.p`
  font-size: clamp(13px, 1.5vw, 15px);
  color: rgba(133, 107, 107, 0.85);
  margin: 0;
`

/* ── 액션 버튼 ── */
const ActionsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin-top: 2px;
`

const Btn = styled.button`
  border-radius: 999px;
  padding: 14px 18px;
  cursor: pointer;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(14px, 1.5vw, 16px);
  width: 100%;
  text-align: center;
  border: none;
  transition: transform 0.1s, filter 0.15s;

  &:hover { filter: brightness(1.03); }
  &:active { transform: translateY(3px); box-shadow: none !important; }
  &:focus-visible { outline: 3px solid rgba(133, 107, 107, 0.45); outline-offset: 2px; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

const SecondaryBtn = styled(Btn)`
  background: #fffdf2;
  color: #856b6b;
  border: 2px solid #d8c9bd;
  box-shadow: 0 4px 0 #e7ddd1;
`

const PrimaryBtn = styled(Btn)`
  background: #856b6b;
  color: #fffdf2;
  box-shadow: 0 4px 0 #6b5555;
`

/* ── 오른쪽: 인생네컷 ── */
const Right = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 660px) {
    order: -1;
  }
`

const SectionLabel = styled.p`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(14px, 1.6vw, 16px);
  color: #463c3c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`

const FourCutPreview = styled.div`
  width: 100%;
  flex: 1;
  aspect-ratio: 720 / 1280;
  border-radius: 18px;
  overflow: hidden;
  background: #1f1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b6a89a;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: 13px;
  border: 3px solid #fff;
  box-shadow: 0 10px 26px rgba(31, 26, 26, 0.22);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #1f1a1a;
    display: block;
  }
`

/* ── 공유 ── */
const ShareCard = styled.div`
  border-radius: 18px;
  padding: 16px;
  background: rgba(133, 107, 107, 0.05);
  border: 1.5px solid rgba(133, 107, 107, 0.14);
  display: grid;
  gap: 14px;
`

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(133, 107, 107, 0.2);
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
  width: clamp(82px, 14vw, 104px);
  aspect-ratio: 1;
  border-radius: 14px;
  background: #fff;
  border: 1.5px solid rgba(133, 107, 107, 0.2);
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
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(13px, 1.4vw, 15px);
  color: #463c3c;
  margin: 0;
`

const QRSub = styled.p`
  font-size: 12px;
  color: #856b6b;
  margin: 0;
  line-height: 1.4;
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
  padding: 12px 16px;
  border-radius: 999px;
  border: 2px solid rgba(133, 107, 107, 0.3);
  background: #fff;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: 14px;
  color: #463c3c;
  box-sizing: border-box;

  &::placeholder { color: rgba(133, 107, 107, 0.55); }
  &:focus { outline: none; border-color: #856b6b; }
  &:disabled { background: #f5f0e8; }
`

const SendBtn = styled.button`
  border-radius: 999px;
  padding: 12px;
  border: none;
  background: #856b6b;
  color: #fffdf2;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 0 #6b5555;
  transition: transform 0.1s, filter 0.15s;

  &:hover { filter: brightness(1.05); }
  &:active { transform: translateY(3px); box-shadow: none; }
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
export function ResultPage({ mode, nickname, onHome, onRanking, onFilter }) {
  const { result } = useGameSession()

  const timeDisplay = formatTime(result?.timeMs)
  const lifeFourCut = result?.lifeFourCut

  const isMulti = mode === 'multi'
  const left = result?.score?.left ?? 0
  const right = result?.score?.right ?? 0

  const outcome = null
  const isWin = isMulti ? left > right : true

  const heroValue = isMulti ? `${left} : ${right}` : timeDisplay
  const heroCaption = isMulti ? '최종 점수' : '총 소요 시간'

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
          <TitleRow>
            <Title>게임 끝!</Title>
          </TitleRow>

          <ResultCard $win={isWin}>
            {outcome && <Outcome $win={isWin}>{outcome}</Outcome>}
            <HeroValue>{heroValue}</HeroValue>
            <HeroCaption>{heroCaption}</HeroCaption>
          </ResultCard>

          <ActionsCol>
            <SecondaryBtn type="button" onClick={onHome}>홈으로 가기</SecondaryBtn>
            <SecondaryBtn type="button" onClick={onRanking}>랭킹 보기</SecondaryBtn>
          </ActionsCol>

          {lifeFourCut && (
            <ShareCard>
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
                  <QRSub>카메라로 스캔하면<br />사진을 다운로드해요</QRSub>
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

              <PrimaryBtn type="button" onClick={onFilter}>사진 찍기 →</PrimaryBtn>
            </ShareCard>
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
