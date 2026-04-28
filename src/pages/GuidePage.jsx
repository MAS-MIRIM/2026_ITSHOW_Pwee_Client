import {
  CenteredColumn,
  CenteredSection,
  GuideMessage,
  Panel,
  PrimaryButton,
} from '../styles/ui'

export function GuidePage({ message, onNext, step }) {
  return (
    <CenteredSection>
      <Panel as={CenteredColumn} $width="520px" $gap="20px" $borderless>
        <GuideMessage>{message}</GuideMessage>
        <PrimaryButton type="button" onClick={onNext}>
          {step === 2 ? '다음' : '확인'}
        </PrimaryButton>
      </Panel>
    </CenteredSection>
  )
}
