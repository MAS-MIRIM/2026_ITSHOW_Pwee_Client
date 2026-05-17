import styled from 'styled-components'
import memoge from '../assets/memoge.svg'

const Wrap = styled.div`
  position: absolute;
  top: -42px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  pointer-events: none;
`

const Img = styled.img`
  display: block;
  width: clamp(128px, 15vw, 192px);
  height: auto;
  filter: drop-shadow(0 10px 14px rgba(133, 107, 107, 0.2));
`

export default function MemoCharacterCard() {
  return (
    <Wrap>
      <Img src={memoge} alt="" />
    </Wrap>
  )
}
