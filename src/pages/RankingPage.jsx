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

const RankingList = styled.div`
  display: grid;
  gap: 10px;
`

const RankingItem = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(133, 107, 107, 0.05);
`

const Button = styled.button`
  border-radius: 12px;
  padding: 14px 16px;
  border: 2px solid #856b6b;
  background: #fffdf2;
  color: #856b6b;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba(133, 107, 107, 0.45);
    outline-offset: 2px;
  }
`

export function RankingPage({ onBack, rankingData }) {
  return (
    <Section>
      <Panel>
        <RankingList>
          {rankingData.map((entry) => (
            <RankingItem key={entry.name}>
              <span>{entry.rank}</span>
              <strong>{entry.name}</strong>
              <span>{entry.score}</span>
            </RankingItem>
          ))}
        </RankingList>
        <Button type="button" onClick={onBack}>
          돌아가기
        </Button>
      </Panel>
    </Section>
  )
}
