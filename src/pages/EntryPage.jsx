import styled from 'styled-components'

const Section = styled.section`
  min-height: inherit;
  display: grid;
  place-items: center;
`

const Panel = styled.article`
  width: min(100%, 420px);
  display: grid;
  gap: 12px;
  justify-items: center;
  align-content: center;
  text-align: center;
`

const Button = styled.button`
  width: 100%;
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

export function EntryPage({ onRanking, onStart }) {
  return (
    <Section>
      <Panel>
        <Button type="button" onClick={onStart}>
          Play
        </Button>
        <Button type="button" onClick={onRanking}>
          Ranking
        </Button>
      </Panel>
    </Section>
  )
}
