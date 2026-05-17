import { useEffect, useRef } from 'react'
import styled from 'styled-components'

const FrameWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
`

const Video = styled.video`
  position: absolute;
  inset: 8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  object-fit: cover;
  border-radius: 20px;
  background: transparent;
  z-index: 0;
  transform: scaleX(-1);
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

export default function WebcamSoloView({ videoRef: externalRef } = {}) {
  const internalRef = useRef(null)
  const videoRef = externalRef ?? internalRef

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
          if (videoRef.current) videoRef.current.srcObject = s
        })
        .catch(() => {
          /* permission denied or no device — frame still renders */
        })
    }

    return () => {
      cancelled = true
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [videoRef])

  return (
    <FrameWrap>
      <Video ref={videoRef} autoPlay muted playsInline />

      <FrameSvg preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="rough-frame-solo" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="4" />
          </filter>
        </defs>
        <g filter="url(#rough-frame-solo)" vectorEffect="non-scaling-stroke">
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
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
