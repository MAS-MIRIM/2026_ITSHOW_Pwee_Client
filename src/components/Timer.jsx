import { useEffect, useState } from 'react'
import styled from 'styled-components'

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
`

const Display = styled.span`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(22px, 2.8vw, 36px);
  font-weight: 600;
  color: #463C3C;
  opacity: 0.85;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
`

export default function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)

    return () => clearInterval(id)
  }, [])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const display = `${mm}:${ss}`

  return (
    <Wrap>
      <Display>{display}</Display>
    </Wrap>
  )
}
