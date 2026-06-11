import styled from 'styled-components'

const Row = styled.div`
  display: grid;
  grid-template-columns: clamp(64px, 7vw, 96px) minmax(0, 1fr) clamp(92px, 12vw, 150px);
  column-gap: clamp(8px, 1vw, 14px);
  align-items: center;
  padding: clamp(16px, 2vw, 26px) clamp(8px, 1vw, 14px);
  border-bottom: 1px solid #EDE3D6;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  font-size: clamp(17px, 2.1vw, 24px);
  font-weight: 500;
  color: #463C3C;
  background: ${({ $rank }) =>
    $rank === 1
      ? 'linear-gradient(90deg, rgba(255, 218, 92, 0.36), rgba(255, 247, 201, 0.42))'
      : $rank === 2
        ? 'linear-gradient(90deg, rgba(255, 232, 135, 0.28), rgba(255, 251, 222, 0.36))'
        : $rank === 3
          ? 'linear-gradient(90deg, rgba(255, 240, 168, 0.24), rgba(255, 253, 238, 0.34))'
          : 'transparent'};

  &:last-child {
    border-bottom: none;
  }
`

const Rank = styled.span`
  display: block;
  text-align: center;
  font-family: 'Suez One', Georgia, serif;
  font-weight: 700;
  font-size: clamp(20px, 2.4vw, 28px);
  color: ${({ $rank }) =>
    $rank === 1
      ? '#B77900'
      : $rank === 2
        ? '#A98700'
        : $rank === 3
          ? '#8A7424'
          : '#463C3C'};
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
    <Row $rank={rank}>
      <Rank $rank={rank}>{rank}</Rank>
      <Cell>{name}</Cell>
      <Cell className="time">{time}</Cell>
    </Row>
  )
}
