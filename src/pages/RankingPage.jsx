export function RankingPage({ onBack, rankingData }) {
  return (
    <section className="single-panel">
      <article className="panel ranking-panel">
        <div className="ranking-list">
          {rankingData.map((entry) => (
            <div key={entry.name} className="ranking-item">
              <span>{entry.rank}</span>
              <strong>{entry.name}</strong>
              <span>{entry.score}</span>
            </div>
          ))}
        </div>
        <button type="button" className="ghost-button action-button" onClick={onBack}>
          돌아가기
        </button>
      </article>
    </section>
  )
}
