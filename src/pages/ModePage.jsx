import { CenteredSection, ModeButton, ModeGrid, ModeName } from '../styles/ui'

export function ModePage({ mode, modeContent, onSelect }) {
  return (
    <CenteredSection>
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
    </CenteredSection>
  )
}
