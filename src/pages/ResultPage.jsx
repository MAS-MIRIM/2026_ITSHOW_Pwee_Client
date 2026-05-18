import styled from 'styled-components'
import { useGameSession } from '../context/gameSession'

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

const Title = styled.h2`
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(22px, 3vw, 30px);
  color: #463C3C;
  text-align: center;
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

function formatTime(ms) {
  if (!ms) return '00:00.00'
  const totalSec = ms / 1000
  const min = Math.floor(totalSec / 60).toString().padStart(2, '0')
  const sec = (totalSec % 60).toFixed(2).padStart(5, '0')
  return `${min}:${sec}`
}

export function ResultPage({ mode, nickname, onHome, onRanking, onFourCut }) {
  const { result } = useGameSession()

  const timeDisplay = formatTime(result?.timeMs)

  const primaryLabel = mode === 'multi' ? '최종 점수' : '총 소요 시간'
  const primaryValue =
    mode === 'multi'
      ? `${result?.score?.left ?? 0} : ${result?.score?.right ?? 0}`
      : timeDisplay

  const secondaryLabel = mode === 'multi' ? '승패 결과' : '소요 시간'
  const secondaryValue =
    mode === 'multi'
      ? (result?.score?.left ?? 0) > (result?.score?.right ?? 0)
        ? `${nickname || 'Player 1'} WIN`
        : (result?.score?.left ?? 0) < (result?.score?.right ?? 0)
          ? `${nickname || 'Player 1'} LOSE`
          : 'DRAW'
      : timeDisplay

  return (
    <Section>
      <Panel>
        <Title>게임 결과</Title>
        <ResultPanel>
          <MetricBox>
            <MetricLabel>{primaryLabel}</MetricLabel>
            <MetricValue>{primaryValue}</MetricValue>
          </MetricBox>
          <MetricBox>
            <MetricLabel>{secondaryLabel}</MetricLabel>
            <MetricValue>{secondaryValue}</MetricValue>
          </MetricBox>
        </ResultPanel>
        <ActionsRow>
          <SecondaryButton type="button" onClick={onHome}>
            홈으로 가기
          </SecondaryButton>
          <SecondaryButton type="button" onClick={onRanking}>
            랭킹으로 가기
          </SecondaryButton>
        </ActionsRow>
        <PrimaryButton type="button" onClick={onFourCut}>
          인생네컷 보기 →
        </PrimaryButton>
      </Panel>
    </Section>
  )
}