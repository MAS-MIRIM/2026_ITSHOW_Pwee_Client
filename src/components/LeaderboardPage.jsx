import styled from 'styled-components'
import LeaderboardPanel from './LeaderboardPanel'

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #FFFDF2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: clamp(36px, 4vw, 64px) clamp(24px, 4vw, 64px) 0;
  box-sizing: border-box;
  overflow: hidden;
`

const BackButton = styled.button`
  position: absolute;
  top: clamp(16px, 2.5vw, 28px);
  right: clamp(16px, 2.5vw, 28px);
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(13px, 1.4vw, 16px);
  color: #463C3C;
  background: #F8E9C8;
  border: 2px solid #856B6B;
  border-radius: 999px;
  padding: 8px 20px;
  cursor: pointer;
  z-index: 10;

  &:hover { background: #FFE9A8; }
`

export default function LeaderboardPage({ rankings = [], onBack }) {
  return (
    <Page>
      {onBack && (
        <BackButton type="button" onClick={onBack}>← 돌아가기</BackButton>
      )}
      <LeaderboardPanel rankings={rankings} />
    </Page>
  )
}
