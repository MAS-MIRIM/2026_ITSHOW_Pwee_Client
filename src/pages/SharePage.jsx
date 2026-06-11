import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useGameSession } from '../context/gameSession'
import { uploadPhoto, sendEmail } from '../api/shareApi'

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

const PreviewColumn = styled.section`
  display: grid;
  justify-items: center;
  gap: 14px;
  min-width: 0;
  order: 2;

  @media (max-width: 760px) {
    order: 1;
    width: 100%;
  }
`

const SharePanel = styled.section`
  width: min(100%, 460px);
  display: grid;
  gap: 20px;
  min-width: 0;
  order: 1;

  @media (max-width: 760px) {
    order: 2;
  }
`

const Header = styled.div`
  display: grid;
  gap: 6px;
`

const Heading = styled.h2`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(34px, 5vw, 54px);
  color: #463C3C;
  margin: 0;
`

const SubText = styled.p`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  color: #856B6B;
  font-size: clamp(12px, 1.4vw, 14px);
  margin: -10px 0 0;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`

const PhotoPreview = styled.div`
  width: min(100%, 520px);
  aspect-ratio: 4 / 3;
  border-radius: 18px;
  overflow: hidden;
  background: #1f1a1a;
  box-shadow: 0 16px 34px rgba(31, 26, 26, 0.14);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const QRSection = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding-top: 16px;
  border-top: 1.5px solid rgba(133, 107, 107, 0.16);
`

const QRBox = styled.div`
  width: clamp(104px, 15vw, 128px);
  aspect-ratio: 1;
  border-radius: 16px;
  background: #fff;
  border: 1.5px solid #e5dfd3;
  display: grid;
  place-items: center;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: contain; display: block; }
`

const QRLabel = styled.p`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(14px, 1.5vw, 16px);
  font-weight: 900;
  color: #463c3c;
  margin: 0;
`

const QRSub = styled.p`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: 12px;
  color: #856b6b;
  margin: 0;
  word-break: keep-all;
`

const QRTextGroup = styled.div`
  display: grid;
  gap: 5px;
`

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid rgba(133, 107, 107, 0.25);
  border-top-color: #856b6b;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;

  @keyframes spin { to { transform: rotate(360deg); } }
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(133, 107, 107, 0.18);
`

const EmailForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding-top: 2px;
`

const EmailLabel = styled.label`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(14px, 1.5vw, 16px);
  font-weight: 900;
  color: #463c3c;
`

const EmailInput = styled.input`
  width: 100%;
  min-height: 52px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid rgba(133, 107, 107, 0.35);
  background: #fff;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: 15px;
  color: #463c3c;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #856b6b;
  }
`

const StatusMsg = styled.p`
  font-size: 13px;
  text-align: center;
  margin: 0;
  color: ${({ $error }) => ($error ? '#c44545' : '#2e7d32')};
`

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`

const Btn = styled.button`
  flex: 1;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(14px, 1.5vw, 16px);
  font-weight: 900;
  border-radius: 12px;
  min-height: 52px;
  padding: 0 16px;
  cursor: pointer;
  border: none;
  transition: transform 0.1s, opacity 0.12s;

  &.primary {
    background: #463c3c;
    color: #fffdf2;
  }
  &.secondary {
    background: #fff;
    color: #463c3c;
    border: 1.5px solid rgba(133, 107, 107, 0.22);
  }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

export function SharePage({ onRanking, onRestart }) {
  const { filterShot, result, shareImage, videoGameId } = useGameSession()
  const imageToShare = shareImage ?? filterShot
  const isSolo = result?.mode === 'solo'

  const [imageId, setImageId]     = useState(null)
  const [qrB64, setQrB64]         = useState(null)
  const [uploadErr, setUploadErr] = useState(null)

  const [email, setEmail]         = useState('')
  const [sending, setSending]     = useState(false)
  const [sendStatus, setSendStatus] = useState(null) // { ok, msg }

  const uploadedRef = useRef(false)

  // Upload image and get QR on mount
  useEffect(() => {
    if (!imageToShare || uploadedRef.current) return
    uploadedRef.current = true

    uploadPhoto(imageToShare, videoGameId)
      .then((res) => {
        setImageId(res.image_id)
        setQrB64(res.qr_b64)
      })
      .catch((err) => {
        setUploadErr(err.message)
      })
  }, [imageToShare, videoGameId])

  const handleSendEmail = async (e) => {
    e.preventDefault()
    if (!email.trim() || !imageId) return
    setSending(true)
    setSendStatus(null)
    try {
      await sendEmail(email.trim(), imageId, videoGameId)
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
      <Stage>
        <SharePanel>
          <Header>
            <Heading>사진 공유</Heading>
            <SubText>Pwee · AR Filter</SubText>
          </Header>

          <QRSection>
            <QRBox>
              {!imageToShare
                ? <QRSub style={{ padding: 8 }}>사진 없음</QRSub>
                : qrB64
                  ? <img src={`data:image/png;base64,${qrB64}`} alt="QR 코드" />
                  : uploadErr
                    ? <QRSub style={{ color: '#c44545', padding: 8, textAlign: 'center' }}>{uploadErr}</QRSub>
                    : <Spinner />
              }
            </QRBox>
            <QRTextGroup>
              <QRLabel>QR 공유</QRLabel>
              <QRSub>카메라로 스캔하면 사진과 영상을 바로 받을 수 있어요.</QRSub>
            </QRTextGroup>
          </QRSection>

          <Divider />

          <EmailForm onSubmit={handleSendEmail}>
            <EmailLabel htmlFor="share-email">이메일 공유</EmailLabel>
            <EmailInput
              id="share-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending || !imageId}
            />
            {sendStatus && (
              <StatusMsg $error={!sendStatus.ok}>{sendStatus.msg}</StatusMsg>
            )}
            <BtnRow>
              <Btn
                type="submit"
                className="primary"
                disabled={sending || !email.trim() || !imageId}
              >
                {sending ? '전송 중...' : '사진·영상 전송'}
              </Btn>
            </BtnRow>
          </EmailForm>

          <Btn
            type="button"
            className="secondary"
            onClick={isSolo ? onRanking : onRestart}
          >
            {isSolo ? '랭킹보기' : '처음으로'}
          </Btn>
        </SharePanel>

        <PreviewColumn>
          {imageToShare && (
            <PhotoPreview>
              <img src={imageToShare} alt="공유 사진" />
            </PhotoPreview>
          )}
        </PreviewColumn>
      </Stage>
    </Page>
  )
}
