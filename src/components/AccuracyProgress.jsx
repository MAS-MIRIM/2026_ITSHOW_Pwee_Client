import styled from 'styled-components'

const Wrap = styled.div`
  width: 100%;
  display: grid;
  gap: 6px;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
`

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  color: #463c3c;
`

const Label = styled.span`
  font-size: clamp(12px, 1.3vw, 14px);
  font-weight: 700;
  letter-spacing: 0.08em;
`

const Value = styled.span`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(14px, 1.6vw, 18px);
  color: #856b6b;
  font-variant-numeric: tabular-nums;
`

const Track = styled.div`
  height: 10px;
  border-radius: 999px;
  background: rgba(133, 107, 107, 0.18);
  overflow: hidden;
`

const Fill = styled.div`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  border-radius: inherit;
  background: ${({ $pct }) => {
    if ($pct >= 80) return '#4f8f62'
    if ($pct >= 50) return '#d7a84c'
    return '#c44545'
  }};
  transition: width 0.25s ease, background 0.2s ease;
`

function normalizeAccuracy(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  const pct = num <= 1 ? num * 100 : num
  return Math.max(0, Math.min(100, pct))
}

export default function AccuracyProgress({ value = 0, label = '정확도' }) {
  const pct = normalizeAccuracy(value)
  const display = Math.round(pct)

  return (
    <Wrap aria-label={`${label} ${display}%`}>
      <Header>
        <Label>{label}</Label>
        <Value>{display}%</Value>
      </Header>
      <Track>
        <Fill $pct={pct} />
      </Track>
    </Wrap>
  )
}
