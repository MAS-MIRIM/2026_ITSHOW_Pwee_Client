export function GamePage({ onFinish }) {
  return (
    <section className="single-panel">
      <article className="panel empty-play-panel">
        <button type="button" className="primary-button action-button" onClick={onFinish}>
          끝내기
        </button>
      </article>
    </section>
  )
}
