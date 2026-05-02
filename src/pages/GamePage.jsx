import styled from 'styled-components'

const Section = styled.section`
  min-height: inherit;
  display: grid;
  place-items: center;
`

const Panel = styled.article`
  width: min(100%, 520px);
  min-height: 240px;
  display: grid;
  place-content: center;
`

const Button = styled.button`
  border-radius: 12px;
  padding: 14px 16px;
  border: 2px solid #856b6b;
  background: #856b6b;
  color: #fffdf2;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba(133, 107, 107, 0.45);
    outline-offset: 2px;
  }
`

export function GamePage({ onFinish }) {
  return (
    <Section>
      <Panel>
        <Button type="button" onClick={onFinish}>
          끝내기
        </Button>
      </Panel>
    </Section>
  )
}
