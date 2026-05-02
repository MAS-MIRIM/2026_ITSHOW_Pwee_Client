import styled from 'styled-components'

const Section = styled.section`
  min-height: inherit;
  display: grid;
  place-items: center;
`

const Panel = styled.article`
  width: min(100%, 520px);
  display: grid;
  gap: 16px;
`

const ResultPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

const MetricBox = styled.div`
  padding: 16px;
  border-radius: 12px;
  display: grid;
  gap: 4px;
  background: rgba(133, 107, 107, 0.05);
`

const MetricLabel = styled.p`
  color: rgba(133, 107, 107, 0.82);
  font-size: 0.95rem;
`

const MetricValue = styled.strong`
  font-size: 1.5rem;
  line-height: 1.2;
`

const ActionsRow = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`

const Button = styled.button`
  flex: 1 1 0;
  border-radius: 12px;
  padding: 14px 16px;
  border: 2px solid #856b6b;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba(133, 107, 107, 0.45);
    outline-offset: 2px;
  }
`

const SecondaryButton = styled(Button)`
  background: #fffdf2;
  color: #856b6b;
`

const PrimaryButton = styled(Button)`
  background: #856b6b;
  color: #fffdf2;
`

export function ResultPage({ currentMode, mode, nickname, onHome, onRanking }) {
  return (
    <Section>
      <Panel>
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
    </Section>
  )
}
