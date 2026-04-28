import styled from 'styled-components'

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`

const Eyebrow = styled.p`
  font-size: 0.875rem;
  color: #666;
`

const Title = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
`

const ProfileChip = styled.div`
  padding: 12px 14px;
  border: 1px solid #d8d8d2;
  border-radius: 12px;
  display: grid;
  gap: 2px;
  min-width: 120px;
`

export function TopBar({ nickname, modeLabel }) {
  return (
    <Header>
      <div>
        <Eyebrow>Pwee Expression Game</Eyebrow>
        <Title>표정 게임 서비스 기본 화면</Title>
      </div>
      <ProfileChip>
        <span>{nickname || 'Guest'}</span>
        <strong>{modeLabel}</strong>
      </ProfileChip>
    </Header>
  )
}
