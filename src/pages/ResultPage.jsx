export function ResultPage({ currentMode, mode, nickname, onHome, onRanking }) {
  return (
    <section className="single-panel">
      <article className="panel result-panel-card centered-result-panel">
        <div className="result-panel">
          <div>
            <p className="metric-label">{currentMode.resultPrimary}</p>
            <strong className="metric-value">{currentMode.resultPrimaryValue}</strong>
          </div>
          <div>
            <p className="metric-label">{currentMode.resultSecondary}</p>
            <strong className="metric-value accent">
              {mode === 'multi'
                ? `${nickname || 'Player 1'} ${currentMode.resultSecondaryValue}`
                : currentMode.resultSecondaryValue}
            </strong>
          </div>
        </div>
        <div className="scene-actions">
          <button type="button" className="ghost-button" onClick={onHome}>
            홈으로 가기
          </button>
          <button type="button" className="primary-button action-button" onClick={onRanking}>
            랭킹으로 가기
          </button>
        </div>
      </article>
    </section>
  )
}
