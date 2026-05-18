import styled from 'styled-components'
import { useGameSession } from '../context/gameSession'

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #fffdf2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 4vw, 48px);
  box-sizing: border-box;
`

const Stage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(20px, 3vw, 32px);
  width: min(400px, 100%);
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
  }
`

const QRBox = styled.div`
  width: clamp(160px, 30vw, 220px);
  aspect-ratio: 1;
  border-radius: 16px;
  background: #fff;
  border: 2px solid #e5dfd3;
  display: grid;
  place-items: center;
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(13px, 1.5vw, 16px);
  color: #856b6b;
  letter-spacing: 0.08em;
`

const BackButton = styled.button`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(14px, 1.6vw, 18px);
  color: #463c3c;
  background: #f8e9c8;
  border: 2px solid #856b6b;
  border-radius: 999px;
  padding: 12px 32px;
  cursor: pointer;

  &:hover {
    background: #ffe9a8;
  }
`

export function SharePage({ onRestart }) {
  const { filterShot } = useGameSession()

  return (
    <Page>
      <Stage>
        {filterShot && (
          <PhotoPreview>
            <img src={filterShot} alt="필터 사진" />
          </PhotoPreview>
        )}
        <QRBox>QR</QRBox>
        <BackButton type="button" onClick={onRestart}>
          돌아가기
        </BackButton>
      </Stage>
    </Page>
  )
}
