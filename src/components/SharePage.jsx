import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { QRCodeCanvas } from 'qrcode.react'
import { useGameSession } from '../context/gameSession'
import { composeFourCut } from '../utils/composeFourCut'
import { downloadDataUrl } from '../utils/downloadDataUrl'
import RoughFrame from './RoughFrame'
import memoge from '../assets/memoge.svg'

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
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(16px, 2.4vw, 28px);
`

const TitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const Heading = styled.h1`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(34px, 5vw, 52px);
  color: #463C3C;
  margin: 0;
  letter-spacing: -0.01em;
`

const SubLine = styled.p`
  font-family: Georgia, serif;
  color: #856B6B;
  font-size: clamp(12px, 1.4vw, 14px);
  margin: 0;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`

const Tabs = styled.div`
  display: inline-flex;
  background: #FFFAEB;
  border: 2px solid #856B6B;
  border-radius: 999px;
  padding: 4px;
`

const Tab = styled.button`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(13px, 1.4vw, 15px);
  border-radius: 999px;
  padding: 8px 22px;
  border: none;
  background: ${({ $active }) => ($active ? '#463C3C' : 'transparent')};
  color: ${({ $active }) => ($active ? '#FFFDF2' : '#463C3C')};
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
`

const Row = styled.div`
  display: flex;
  gap: clamp(16px, 3vw, 40px);
  align-items: stretch;
  flex-wrap: wrap;
  justify-content: center;
`

const PreviewCol = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const PreviewWrap = styled.div`
  position: relative;
  width: clamp(220px, 28vw, 320px);
  aspect-ratio: ${({ $portrait }) => ($portrait ? '720 / 1280' : '4 / 3')};
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

  img { width: 100%; height: 100%; object-fit: contain; }
  span { color: #B6A89A; font-family: Georgia, serif; }
`

const Memoge = styled.img`
  position: absolute;
  width: 92px;
  top: -34px;
  left: -42px;
  transform: rotate(-12deg);
  filter: drop-shadow(0 8px 10px rgba(133, 107, 107, 0.25));
  z-index: 4;

  @media (max-width: 640px) {
    width: 70px;
    left: -8px;
    top: -28px;
  }
`

const QrCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
`

const QrCard = styled.div`
  position: relative;
  background: #FFFAEB;
  padding: 24px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  small.label {
    font-family: 'Suez One', Georgia, serif;
    font-size: 14px;
    color: #463C3C;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  small.url {
    font-family: Georgia, serif;
    font-size: 10px;
    color: #856B6B;
    opacity: 0.7;
    word-break: break-all;
    max-width: 180px;
    text-align: center;
  }
`

const QrCallout = styled.div`
  font-family: 'Suez One', Georgia, serif;
  font-size: 13px;
  color: #463C3C;
  background: #F8E9C8;
  padding: 6px 14px;
  border-radius: 999px;
  border: 2px solid #C9A861;
  letter-spacing: 0.1em;
`

const Actions = styled.div`
  display: flex;
  gap: 12px;
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

function mockId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function SharePage() {
  const navigate = useNavigate()
  const { filterShot, fourCutShots, reset } = useGameSession()
  const [tab, setTab] = useState(filterShot ? 'filter' : 'fourcut')
  const [fourCutUrl, setFourCutUrl] = useState(null)

  // Swap to the real upload URL once the backend is wired up.
  const shareUrl = useMemo(() => `https://pwee.app/s/${mockId()}`, [])

  useEffect(() => {
    let cancelled = false
    composeFourCut(fourCutShots).then((url) => {
      if (!cancelled) setFourCutUrl(url)
    })
    return () => { cancelled = true }
  }, [fourCutShots])

  const currentImage = tab === 'filter' ? filterShot : fourCutUrl
  const isPortrait = tab === 'fourcut'

  return (
    <Page>
      <Stage>
        <TitleWrap>
          <Heading>공유하기</Heading>
          <SubLine>Save · Share · Show off</SubLine>
        </TitleWrap>

        <Tabs>
          <Tab type="button" $active={tab === 'filter'} onClick={() => setTab('filter')}>필터 컷</Tab>
          <Tab type="button" $active={tab === 'fourcut'} onClick={() => setTab('fourcut')}>인생네컷</Tab>
        </Tabs>

        <Row>
          <PreviewCol>
            <Memoge src={memoge} alt="" />
            <PreviewWrap $portrait={isPortrait}>
              <PreviewInner>
                {currentImage
                  ? <img src={currentImage} alt={tab} />
                  : <span>준비 중…</span>}
              </PreviewInner>
              <RoughFrame color="#856B6B" rx={18} seed={5} strokeWidth={3} />
            </PreviewWrap>
          </PreviewCol>

          <QrCol>
            <QrCallout>📱 SCAN ME</QrCallout>
            <div style={{ position: 'relative' }}>
              <QrCard>
                <QRCodeCanvas value={shareUrl} size={180} includeMargin fgColor="#463C3C" bgColor="#FFFAEB" />
                <small className="label">QR로 다운로드</small>
                <small className="url">{shareUrl}</small>
              </QrCard>
              <RoughFrame color="#856B6B" rx={20} seed={9} strokeWidth={3} />
            </div>
          </QrCol>
        </Row>

        <Actions>
          <Btn
            type="button"
            className="secondary"
            onClick={() => currentImage && downloadDataUrl(currentImage, `pwee-${tab}.png`)}
            disabled={!currentImage}
          >
            ⬇ PNG 다운로드
          </Btn>
          <Btn
            type="button"
            className="primary"
            onClick={() => { reset(); navigate('/') }}
          >
            홈으로 →
          </Btn>
        </Actions>
      </Stage>
    </Page>
  )
}
