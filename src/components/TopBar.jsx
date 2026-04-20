export function TopBar({ nickname, modeLabel }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Pwee Expression Game</p>
        <h1>표정 게임 서비스 기본 화면</h1>
      </div>
      <div className="profile-chip">
        <span>{nickname || 'Guest'}</span>
        <strong>{modeLabel}</strong>
      </div>
    </header>
  )
}
