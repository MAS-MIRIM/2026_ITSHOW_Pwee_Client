import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useGameSession } from '../context/gameSession'
import { composeFourCut } from '../utils/composeFourCut'
import { downloadDataUrl } from '../utils/downloadDataUrl'
import RoughFrame from './RoughFrame'
import tape from '../assets/tape.svg'

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #FFFDF2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 48px);
  box-sizing: border-box;
  overflow: auto;
`

const Stage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(16px, 2.4vw, 28px);
  position: relative;
`

const Heading = styled.h1`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(34px, 5vw, 54px);
  color: #463C3C;
  margin: 0;
  letter-spacing: -0.01em;
`

const SubLine = styled.p`
  font-family: Georgia, serif;
  color: #856B6B;
  font-size: clamp(12px, 1.4vw, 14px);
  margin: -10px 0 0;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`

const PreviewWrap = styled.div`
  position: relative;
  width: clamp(260px, 38vw, 380px);
  aspect-ratio: 720 / 1280;
`

const PreviewInner = styled.div`
  position: absolute;
  inset: 0;
  background: #1F1A1A;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #B6A89A;
  font-family: Georgia, serif;
  z-index: 1;

  img { width: 100%; height: 100%; object-fit: contain; background: #1F1A1A; }
`

const TapeTop = styled.img`
  position: absolute;
  width: clamp(80px, 12vw, 120px);
  top: -14px;
  left: 50%;
  transform: translateX(-50%) rotate(-4deg);
  z-index: 3;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,0.12));
`

const TapeCorner = styled.img`
  position: absolute;
  width: clamp(64px, 9vw, 90px);
  bottom: -10px;
  ${({ $side }) => ($side === 'left' ? 'left: -16px; transform: rotate(-26deg);' : 'right: -16px; transform: rotate(26deg);')}
  z-index: 3;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,0.12));
`

const Actions = styled.div`
  display: flex;
  gap: clamp(10px, 1.5vw, 18px);
  flex-wrap: wrap;
  justify-content: center;
`

const Btn = styled.button`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(14px, 1.6vw, 18px);
  border-radius: 999px;
  padding: 14px 28px;
  cursor: pointer;
  border: none;
  transition: transform 0.12s ease, box-shadow 0.12s ease;

  &.primary {
    background: #463C3C;
    color: #FFFDF2;
    box-shadow: 0 6px 0 #1F1717, 0 12px 18px rgba(70, 60, 60, 0.18);
  }
  &.secondary {
    background: #F8E9C8;
    color: #463C3C;
    box-shadow: 0 6px 0 #C9A861, 0 12px 18px rgba(133, 107, 107, 0.18);
  }
  &:active {
    transform: translateY(3px);
    box-shadow: 0 3px 0 #1F1717, 0 6px 10px rgba(70, 60, 60, 0.18);
  }
  &.secondary:active {
    box-shadow: 0 3px 0 #C9A861, 0 6px 10px rgba(133, 107, 107, 0.18);
  }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`

export default function FourCutPage({ onFilter }) {
  const { fourCutShots, result } = useGameSession()
  const [composed, setComposed] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const lifeFourCut = result?.lifeFourCut

  useEffect(() => {
    // Backend-generated four-cut takes priority
    if (lifeFourCut) {
      setComposed(`data:image/jpeg;base64,${lifeFourCut}`)
      setLoaded(true)
      return
    }

    let cancelled = false
    composeFourCut(fourCutShots).then((url) => {
      if (!cancelled) {
        setComposed(url)
        setLoaded(true)
      }
    })
    return () => { cancelled = true }
  }, [lifeFourCut, fourCutShots])

  const hasShots = lifeFourCut ? true : fourCutShots?.some(Boolean)

  return (
    <Page>
      <Stage>
        <Heading>인생네컷</Heading>
        <SubLine>Pwee · Photo Booth</SubLine>

        <PreviewWrap>
          <TapeTop src={tape} alt="" />
          <PreviewInner>
            {!loaded
              ? '합성 중...'
              : composed && hasShots
                ? <img src={composed} alt="인생네컷" />
                : '캡처된 사진이 없어요'}
          </PreviewInner>
          <RoughFrame color="#856B6B" rx={18} seed={6} strokeWidth={3} />
          <TapeCorner $side="left" src={tape} alt="" />
          <TapeCorner $side="right" src={tape} alt="" />
        </PreviewWrap>

        <Actions>
          <Btn
            type="button"
            className="secondary"
            onClick={() => composed && downloadDataUrl(composed, 'pwee-fourcut.png')}
            disabled={!composed || !hasShots}
          >
            ⬇ 다운로드
          </Btn>
          <Btn type="button" className="primary" onClick={onFilter}>
            필터로 사진 찍기 →
          </Btn>
        </Actions>
      </Stage>
    </Page>
  )
}
