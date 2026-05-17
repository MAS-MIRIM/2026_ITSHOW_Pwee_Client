import { useId } from 'react'
import styled from 'styled-components'

const Svg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  overflow: visible;
`

export default function RoughFrame({
  color = '#856B6B',
  strokeWidth = 3,
  rx = 24,
  seed = 3,
  fill = 'none',
  scale = 4,
  inset = 2,
}) {
  const raw = useId()
  const id = `rf-${raw.replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <Svg preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale={scale} />
        </filter>
      </defs>
      <g filter={`url(#${id})`} vectorEffect="non-scaling-stroke">
        <rect
          x={inset}
          y={inset}
          width={`calc(100% - ${inset * 2}px)`}
          height={`calc(100% - ${inset * 2}px)`}
          rx={rx}
          ry={rx}
          stroke={color}
          fill={fill}
          strokeWidth={strokeWidth}
        />
      </g>
    </Svg>
  )
}
