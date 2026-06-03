import styled from 'styled-components'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  user-select: none;
`

const Label = styled.span`
  font-family: 'Suez One', Georgia, serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #463C3C;
  opacity: 0.7;
  line-height: 1;
  padding-top: 4px;
`

const Value = styled.span`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(22px, 3.6vw, 34px);
  font-weight: 700;
  line-height: 1;
  color: #463C3C;
  letter-spacing: -0.02em;
  margin-top: -2px;
`

export default function ScoreBoard({ value = 0, label }) {
  return (
    <Wrap>
      <Label>{label ?? 'score'}</Label>
      <Value>{value}</Value>
    </Wrap>
  )
}
