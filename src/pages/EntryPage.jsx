import {
  CenteredColumn,
  CenteredSection,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from '../styles/ui'

export function EntryPage({ onRanking, onStart }) {
  return (
    <CenteredSection>
      <Panel as={CenteredColumn} $width="420px" $gap="12px" $borderless>
        <PrimaryButton type="button" onClick={onStart}>
          시작하기
        </PrimaryButton>
        <SecondaryButton type="button" onClick={onRanking}>
          랭킹화면 가기
        </SecondaryButton>
      </Panel>
    </CenteredSection>
  )
}
