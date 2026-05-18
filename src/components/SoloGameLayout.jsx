import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import WebcamSoloView from './WebcamSoloView'
import MemoCharacterCard from './MemoCharacterCard'
import Timer from './Timer'
import { useGameSession } from '../context/gameSession'
import { useWebcamCapture } from '../hooks/useWebcamCapture'

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #FFFDF2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 48px);
  box-sizing: border-box;
  overflow: hidden;
`

const Stage = styled.div`
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(16px, 2vw, 26px);
  padding-top: clamp(56px, 7vh, 80px);
`

const CamFrame = styled.div`
  position: relative;
  width: 100%;
`

const EndButton = styled.button`
  align-self: center;
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(14px, 1.6vw, 18px);
  color: #463C3C;
  background: #F8E9C8;
  border: 2px solid #856B6B;
  border-radius: 999px;
  padding: 10px 22px;
  cursor: pointer;

  &:hover { background: #FFE9A8; }
`

export default function SoloGameLayout({ onFinish }) {
  const videoRef = useRef(null)
  const startRef = useRef(null)
  const { pushCapture, setResult, pickFourCut } = useGameSession()

  useEffect(() => {
    startRef.current = Date.now()
  }, [])

  useWebcamCapture(videoRef, { enabled: true, intervalMs: 3000, onCapture: pushCapture })

  const handleEnd = () => {
    // Placeholder until real game-end signal: capture elapsed time + pick 4-cut from buffer.
    const timeMs = Date.now() - (startRef.current ?? Date.now())
    setResult({ mode: 'solo', timeMs, score: 10 })
    pickFourCut()
    onFinish()
  }

  return (
    <Page>
      <Stage>
        <CamFrame>
          <WebcamSoloView videoRef={videoRef} />
          <MemoCharacterCard />
        </CamFrame>
        <Timer />
        <EndButton type="button" onClick={handleEnd}>게임 종료 (테스트)</EndButton>
      </Stage>
    </Page>
  )
}
