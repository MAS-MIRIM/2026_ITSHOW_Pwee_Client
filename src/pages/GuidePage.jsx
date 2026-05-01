import { useEffect, useState } from 'react'
import {
  CenteredColumn,
  CenteredSection,
  GuideMessage,
  GuideMessageFrame,
  Panel,
} from '../styles/ui'

const GUIDE_DURATION_MS = 3000
const GUIDE_FADE_DURATION_MS = 600

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
    <CenteredSection>
      <Panel as={CenteredColumn} $width="520px" $gap="20px" $borderless>
        <GuideMessageFrame $fading={isFading}>
          <GuideMessage>{message}</GuideMessage>
        </GuideMessageFrame>
      </Panel>
    </CenteredSection>
  )
}
