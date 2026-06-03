import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useGameSession } from '../context/gameSession'
import { uploadPhoto, sendEmail } from '../api/shareApi'

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #fffdf2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 4vw, 48px);
  box-sizing: border-box;
  overflow: auto;
`

const Stage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(18px, 2.4vw, 28px);
  width: min(400px, 100%);
`

const Heading = styled.h2`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(22px, 3vw, 30px);
  color: #463c3c;
  margin: 0;
`

const PhotoPreview = styled.div`
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 18px;
  overflow: hidden;
  background: #1f1a1a;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const QRSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const QRBox = styled.div`
  width: clamp(140px, 26vw, 180px);
  aspect-ratio: 1;
  border-radius: 14px;
  background: #fff;
  border: 2px solid #e5dfd3;
  display: grid;
  place-items: center;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: contain; display: block; }
`

const QRLabel = styled.p`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(11px, 1.3vw, 13px);
  color: #856b6b;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0;
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
  gap: 10px;
  width: 100%;
`

const EmailLabel = styled.label`
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(12px, 1.4vw, 14px);
  color: #856b6b;
  letter-spacing: 0.06em;
`

const EmailInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid rgba(133, 107, 107, 0.35);
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
  font-size: clamp(14px, 1.6vw, 17px);
  border-radius: 999px;
  padding: 13px 16px;
  cursor: pointer;
  border: none;
  transition: transform 0.1s;

  &.primary {
    background: #463c3c;
    color: #fffdf2;
    box-shadow: 0 5px 0 #1f1717;
  }
  &.secondary {
    background: #f8e9c8;
    color: #463c3c;
    box-shadow: 0 5px 0 #c9a861;
  }
  &:active { transform: translateY(3px); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

export function SharePage({ onRestart }) {
  const { filterShot, shareImage } = useGameSession()
  const imageToShare = shareImage ?? filterShot

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

    uploadPhoto(imageToShare)
      .then((res) => {
        setImageId(res.image_id)
        setQrB64(res.qr_b64)
      })
      .catch((err) => {
        setUploadErr(err.message)
      })
  }, [imageToShare])

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
      <Stage>
        <Heading>사진 공유</Heading>

        {imageToShare && (
          <PhotoPreview>
            <img src={imageToShare} alt="공유 사진" />
          </PhotoPreview>
        )}

        <QRSection>
          <QRBox>
            {!imageToShare
              ? <QRLabel style={{ padding: 8 }}>사진 없음</QRLabel>
              : qrB64
                ? <img src={`data:image/png;base64,${qrB64}`} alt="QR 코드" />
                : uploadErr
                  ? <QRLabel style={{ color: '#c44545', padding: 8, textAlign: 'center' }}>{uploadErr}</QRLabel>
                  : <Spinner />
            }
          </QRBox>
          <QRLabel>QR로 다운로드</QRLabel>
        </QRSection>

        <Divider />

        <EmailForm onSubmit={handleSendEmail}>
          <EmailLabel htmlFor="share-email">이메일로 받기</EmailLabel>
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
              {sending ? '전송 중...' : '📧 전송'}
            </Btn>
          </BtnRow>
        </EmailForm>

        <Btn type="button" className="secondary" onClick={onRestart}>
          돌아가기
        </Btn>
      </Stage>
    </Page>
  )
}
