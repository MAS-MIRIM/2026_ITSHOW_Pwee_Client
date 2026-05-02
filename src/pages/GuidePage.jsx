import { useEffect, useState } from 'react'
import styled from 'styled-components'

const GUIDE_DURATION_MS = 3000
const GUIDE_FADE_DURATION_MS = 600

const Section = styled.section`
  min-height: inherit;
  display: grid;
  place-items: center;
`

const Panel = styled.article`
  width: min(100%, 520px);
  display: grid;
  gap: 20px;
  justify-items: center;
  align-content: center;
  text-align: center;
`

const MessageFrame = styled.div`
  opacity: ${({ $fading }) => ($fading ? 0 : 1)};
  transition: opacity 600ms ease;
`

const Message = styled.strong`
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  line-height: 1.4;
  text-align: center;
`

export function GuidePage({ message, onNext }) {
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    setIsFading(false)

    const fadeTimer = window.setTimeout(() => {
      setIsFading(true)
    }, GUIDE_DURATION_MS - GUIDE_FADE_DURATION_MS)

    const nextTimer = window.setTimeout(() => {
      onNext()
    }, GUIDE_DURATION_MS)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(nextTimer)
    }
  }, [message, onNext])

  return (
    <Section>
      <Panel>
        <MessageFrame $fading={isFading}>
          <Message>{message}</Message>
        </MessageFrame>
      </Panel>
    </Section>
  )
}
