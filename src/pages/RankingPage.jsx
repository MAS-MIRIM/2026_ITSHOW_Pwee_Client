import {
  CenteredSection,
  Panel,
  RankingItem,
  RankingList,
  SecondaryButton,
} from '../styles/ui'

export function RankingPage({ onBack, rankingData }) {
  return (
    <CenteredSection>
      <Panel $width="520px" $borderless>
        <RankingList>
          {rankingData.map((entry) => (
            <RankingItem key={entry.name}>
              <span>{entry.rank}</span>
              <strong>{entry.name}</strong>
              <span>{entry.score}</span>
            </RankingItem>
          ))}
        </RankingList>
        <SecondaryButton type="button" onClick={onBack}>
          돌아가기
        </SecondaryButton>
      </Panel>
    </CenteredSection>
  )
}
