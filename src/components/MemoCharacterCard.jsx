import styled from 'styled-components'
import memoge from '../assets/memoge.svg'

const Wrap = styled.div`
  position: absolute;
  top: -42px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  pointer-events: none;
  width: clamp(160px, 20vw, 240px);
`

const Img = styled.img`
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 14px rgba(133, 107, 107, 0.2));
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-bottom: 6px;
`

const Emoji = styled.span`
  font-size: clamp(28px, 5vw, 48px);
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
`

const Label = styled.span`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(11px, 1.4vw, 15px);
  color: #463c3c;
`

export default function MemoCharacterCard({ emoji, label }) {
  return (
    <Wrap>
      <Img src={memoge} alt="" />
      {emoji && (
        <Overlay>
          <Emoji>{emoji}</Emoji>
          {label && <Label>{label}</Label>}
        </Overlay>
      )}
    </Wrap>
  )
}
