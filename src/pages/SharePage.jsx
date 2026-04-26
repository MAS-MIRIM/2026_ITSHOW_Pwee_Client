export function SharePage({ captureCards, onRestart }) {
  return (
    <section className="page-grid">
      <article className="panel share-panel">
        <div className="capture-grid">
          {captureCards.map((item) => (
            <div key={item} className="capture-card">
              {item}
            </div>
          ))}
        </div>
      </article>

      <article className="panel share-action-panel">
        <div className="qr-box">QR</div>
        <div className="share-actions">
          <button type="button" className="primary-button">
            QR 다운로드
          </button>
          <button type="button" className="ghost-button">
            인스타 공유
          </button>
        </div>
        <button type="button" className="primary-button action-button" onClick={onRestart}>
          처음으로 돌아가기
        </button>
      </article>
    </section>
  )
}
