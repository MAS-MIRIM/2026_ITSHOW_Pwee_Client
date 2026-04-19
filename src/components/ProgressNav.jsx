export function ProgressNav({ currentPage, pageMeta, pageOrder }) {
  return (
    <nav className="progress-nav" aria-label="game progress">
      {pageOrder.map((item) => {
        const isActive = currentPage === item
        const isComplete = pageOrder.indexOf(item) < pageOrder.indexOf(currentPage)

        return (
          <div
            key={item}
            className={[
              'progress-step',
              isActive ? 'active' : '',
              isComplete ? 'complete' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span>{pageMeta[item].step}</span>
            <strong>{pageMeta[item].title}</strong>
          </div>
        )
      })}
    </nav>
  )
}
