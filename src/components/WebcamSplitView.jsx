import { useEffect, useRef } from 'react'
import styled from 'styled-components'

const FrameWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
`

const Pane = styled.div`
  position: absolute;
  top: 8px;
  height: calc(100% - 16px);
  width: calc(50% - 30px);
  overflow: hidden;
  border-radius: 20px;
  background: transparent;
  z-index: 0;

  &.left {
    left: 8px;
  }
  &.right {
    right: 8px;
  }
`

const Video = styled.video`
  position: absolute;
  top: 0;
  width: 200%;
  height: 100%;
  object-fit: cover;
  background: transparent;
  transform: scaleX(-1);

  &.left {
    left: 0;
  }
  &.right {
    right: 0;
  }
`

const FrameSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
`

export default function WebcamSplitView({ leftVideoRef: externalLeft, rightVideoRef: externalRight } = {}) {
  const internalLeft = useRef(null)
  const internalRight = useRef(null)
  const leftVideoRef = externalLeft ?? internalLeft
  const rightVideoRef = externalRight ?? internalRight

  useEffect(() => {
    let stream = null
    let cancelled = false

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => {
          if (cancelled) {
            s.getTracks().forEach((t) => t.stop())
            return
          }
          stream = s
          if (leftVideoRef.current) leftVideoRef.current.srcObject = s
          if (rightVideoRef.current) rightVideoRef.current.srcObject = s
        })
        .catch(() => {
          /* permission denied or no device — frame still renders */
        })
    }

    return () => {
      cancelled = true
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [leftVideoRef, rightVideoRef])

  return (
    <FrameWrap>
      <Pane className="left">
        <Video ref={leftVideoRef} className="left" autoPlay muted playsInline />
      </Pane>
      <Pane className="right">
        <Video ref={rightVideoRef} className="right" autoPlay muted playsInline />
      </Pane>

      <FrameSvg preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="rough-frame" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="4" />
          </filter>
        </defs>
        <g filter="url(#rough-frame)" vectorEffect="non-scaling-stroke">
          <rect
            x="2"
            y="2"
            width="calc(50% - 18px)"
            height="calc(100% - 4px)"
            rx="24"
            ry="24"
            stroke="#856B6B"
            fill="none"
            strokeWidth="3"
          />
          <rect
            x="calc(50% + 16px)"
            y="2"
            width="calc(50% - 18px)"
            height="calc(100% - 4px)"
            rx="24"
            ry="24"
            stroke="#856B6B"
            fill="none"
            strokeWidth="3"
          />
        </g>
      </FrameSvg>
    </FrameWrap>
  )
}
