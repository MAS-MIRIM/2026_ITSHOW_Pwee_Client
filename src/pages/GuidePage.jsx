export function GuidePage({ message, onNext, step }) {
  return (
    <section className="single-panel">
      <article className="panel guide-panel">
        <strong className="guide-message">{message}</strong>
        <button type="button" className="primary-button action-button" onClick={onNext}>
          {step === 2 ? '다음' : '확인'}
        </button>
      </article>
    </section>
  )
}
