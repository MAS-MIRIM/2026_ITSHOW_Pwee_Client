export function NamePage({ nickname, onNext, setNickname }) {
  const canStart = nickname.trim().length > 0

  return (
    <section className="single-panel">
      <article className="panel form-panel entry-panel">
        <input
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="닉네임 입력"
        />
        <button
          type="button"
          className="primary-button action-button"
          disabled={!canStart}
          onClick={onNext}
        >
          확인
        </button>
      </article>
    </section>
  )
}
