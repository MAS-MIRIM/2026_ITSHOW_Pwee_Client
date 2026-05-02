import styled from 'styled-components'

const Section = styled.section`
  min-height: inherit;
  display: grid;
  place-items: center;
`

const ModeGrid = styled.section`
  width: min(100%, 640px);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

const ModeButton = styled.button`
  min-height: 160px;
  padding: 24px 20px;
  border: 1px solid
    ${({ $active }) => ($active ? '#856b6b' : 'rgba(133, 107, 107, 0.22)')};
  border-radius: 16px;
  background: ${({ $active }) =>
    $active ? 'rgba(133, 107, 107, 0.08)' : '#fffdf2'};
  color: #856b6b;
  text-align: left;
  cursor: pointer;
`

const ModeName = styled.strong`
  font-size: 1.25rem;
  font-weight: 700;
`

export function ModePage({ mode, modeContent, onSelect }) {
  return (
    <Section>
      <ModeGrid>
        {Object.entries(modeContent).map(([key, item]) => (
          <ModeButton
            key={key}
            type="button"
            $active={mode === key}
            onClick={() => onSelect(key)}
          >
            <ModeName>{item.label}</ModeName>
          </ModeButton>
        ))}
      </ModeGrid>
    </Section>
  )
}
