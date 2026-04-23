export function ModePage({ mode, modeContent, onSelect }) {
  return (
    <section className="single-panel">
      <section className="mode-grid centered-mode-grid">
        {Object.entries(modeContent).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className={mode === key ? 'mode-card active mode-button-card' : 'mode-card mode-button-card'}
            onClick={() => onSelect(key)}
          >
            <strong className="mode-name">{item.label}</strong>
          </button>
        ))}
      </section>
    </section>
  )
}
