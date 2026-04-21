export function EntryPage({ onRanking, onStart }) {
  return (
    <section className="single-panel">
      <article className="panel home-panel">
        <button type="button" className="primary-button action-button" onClick={onStart}>
          시작하기
        </button>
        <button type="button" className="ghost-button action-button" onClick={onRanking}>
          랭킹화면 가기
        </button>
      </article>
    </section>
  )
}
