import styled from 'styled-components'

const Row = styled.div`
  display: grid;
  grid-template-columns: clamp(64px, 7vw, 96px) auto 1fr;
  column-gap: clamp(8px, 1vw, 14px);
  align-items: center;
  padding: clamp(16px, 2vw, 26px) clamp(8px, 1vw, 14px);
  border-bottom: 1px solid #EDE3D6;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(17px, 2.1vw, 24px);
  font-weight: 500;
  color: #463C3C;

  &:last-child {
    border-bottom: none;
  }
`

const Rank = styled.span`
  display: block;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-weight: 700;
  font-size: clamp(20px, 2.4vw, 28px);
  color: #463C3C;
`

const Cell = styled.span`
  display: block;
  &.time {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
`

export default function LeaderboardRow({ rank, name, time }) {
  return (
    <Row>
      <Rank>{rank}</Rank>
      <Cell>{name}</Cell>
      <Cell className="time">{time}</Cell>
    </Row>
  )
}
