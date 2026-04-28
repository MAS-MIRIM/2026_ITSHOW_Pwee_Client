import {
  ActionsRow,
  CenteredSection,
  MetricBox,
  MetricLabel,
  MetricValue,
  Panel,
  PrimaryButton,
  ResultPanel,
  SecondaryButton,
} from '../styles/ui'

export function ResultPage({ currentMode, mode, nickname, onHome, onRanking }) {
  return (
    <CenteredSection>
      <Panel $width="520px" $borderless>
        <ResultPanel>
          <MetricBox>
            <MetricLabel>{currentMode.resultPrimary}</MetricLabel>
            <MetricValue>{currentMode.resultPrimaryValue}</MetricValue>
          </MetricBox>
          <MetricBox>
            <MetricLabel>{currentMode.resultSecondary}</MetricLabel>
            <MetricValue>
              {mode === 'multi'
                ? `${nickname || 'Player 1'} ${currentMode.resultSecondaryValue}`
                : currentMode.resultSecondaryValue}
            </MetricValue>
          </MetricBox>
        </ResultPanel>
        <ActionsRow>
          <SecondaryButton type="button" onClick={onHome}>
            홈으로 가기
          </SecondaryButton>
          <PrimaryButton type="button" onClick={onRanking}>
            랭킹으로 가기
          </PrimaryButton>
        </ActionsRow>
      </Panel>
    </CenteredSection>
  )
}
