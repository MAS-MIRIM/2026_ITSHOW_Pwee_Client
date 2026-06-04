import styled from 'styled-components'
import memoge from '../assets/memoge.svg'

const Wrap = styled.div`
  position: absolute;
  top: -68px;
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
  align-items: center;
  justify-content: center;
  padding-bottom: 8px;
`

const Emoji = styled.span`
  font-size: clamp(44px, 8vw, 72px);
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
`

export default function MemoCharacterCard({ emoji }) {
  return (
    <Wrap>
      <Img src={memoge} alt="" />
      {emoji && (
        <Overlay>
          <Emoji>{emoji}</Emoji>
        </Overlay>
      )}
    </Wrap>
  )
}
