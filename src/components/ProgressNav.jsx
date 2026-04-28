import styled from 'styled-components'

const Nav = styled.nav`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
`

const Step = styled.div`
  padding: 12px 14px;
  border: 1px solid
    ${({ $active, $complete }) => ($active || $complete ? '#222' : '#d8d8d2')};
  border-radius: 12px;
  background: ${({ $active }) => ($active ? '#f0f0ec' : '#fff')};
  color: #222;
  display: grid;
  gap: 2px;
`

export function ProgressNav({ currentPage, pageMeta, pageOrder }) {
  return (
    <Nav aria-label="game progress">
      {pageOrder.map((item) => {
        const isActive = currentPage === item
        const isComplete = pageOrder.indexOf(item) < pageOrder.indexOf(currentPage)

        return (
          <Step
            key={item}
            $active={isActive}
            $complete={isComplete}
          >
            <span>{pageMeta[item].step}</span>
            <strong>{pageMeta[item].title}</strong>
          </Step>
        )
      })}
    </Nav>
  )
}
