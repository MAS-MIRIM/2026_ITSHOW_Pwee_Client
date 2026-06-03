import styled from 'styled-components'
import LeaderboardRow from './LeaderboardRow'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
`

const Header = styled.div`
  display: grid;
  grid-template-columns: clamp(64px, 7vw, 96px) auto 1fr;
  column-gap: clamp(8px, 1vw, 14px);
  align-items: center;
  padding: clamp(16px, 2vw, 26px) clamp(8px, 1vw, 14px);
  border-bottom: 1px solid #E5DFD3;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(20px, 2.6vw, 28px);
  font-weight: 700;
  color: #463C3C;
  letter-spacing: 0.06em;
`

const HeaderCell = styled.span`
  display: block;
  &.time {
    text-align: right;
  }
`

const ScrollBody = styled.div`
  overflow-y: auto;
  max-height: clamp(380px, 52vh, 540px);

  /* subtle scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #C9B7A8 transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #C9B7A8;
    border-radius: 999px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`

export default function LeaderboardTable({ rankings }) {
  return (
    <Wrap>
      <Header>
        <HeaderCell>RANK</HeaderCell>
        <HeaderCell>NAME</HeaderCell>
        <HeaderCell className="time">TIME</HeaderCell>
      </Header>
      <ScrollBody>
        {rankings.map((r) => (
          <LeaderboardRow key={r.rank} rank={r.rank} name={r.name} time={r.time} />
        ))}
      </ScrollBody>
    </Wrap>
  )
}
