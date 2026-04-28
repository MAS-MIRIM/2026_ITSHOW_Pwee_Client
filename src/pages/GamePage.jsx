import { CenteredSection, PlaceholderPanel, PrimaryButton } from '../styles/ui'

export function GamePage({ onFinish }) {
  return (
    <CenteredSection>
      <PlaceholderPanel $width="520px" $borderless>
        <PrimaryButton type="button" onClick={onFinish}>
          끝내기
        </PrimaryButton>
      </PlaceholderPanel>
    </CenteredSection>
  )
}
