import styled from 'styled-components'

const Section = styled.section`
  min-height: inherit;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const Panel = styled.article`
  width: 100%;
  display: grid;
  gap: 16px;
`

const CaptureGrid = styled.div`
  display: grid;
  gap: 12px;
`

const CaptureCard = styled.div`
  padding: 16px;
  border-radius: 12px;
  background: rgba(133, 107, 107, 0.04);
`

const QRBox = styled.div`
  min-height: 180px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(133, 107, 107, 0.04);
  font-weight: 600;
`

const ActionsRow = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`

const Button = styled.button`
  border-radius: 12px;
  padding: 14px 16px;
  border: 2px solid #856b6b;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba(133, 107, 107, 0.45);
    outline-offset: 2px;
  }
`

const PrimaryButton = styled(Button)`
  background: #856b6b;
  color: #fffdf2;
`

const SecondaryButton = styled(Button)`
  background: #fffdf2;
  color: #856b6b;
`

export function SharePage({ captureCards, onRestart }) {
  return (
    <Section>
      <Panel>
        <CaptureGrid>
          {captureCards.map((item) => (
            <CaptureCard key={item}>
              {item}
            </CaptureCard>
          ))}
        </CaptureGrid>
      </Panel>

      <Panel>
        <QRBox>QR</QRBox>
        <ActionsRow>
          <PrimaryButton type="button">
            QR 다운로드
          </PrimaryButton>
          <SecondaryButton type="button">
            인스타 공유
          </SecondaryButton>
        </ActionsRow>
        <PrimaryButton type="button" onClick={onRestart}>
          처음으로 돌아가기
        </PrimaryButton>
      </Panel>
    </Section>
  )
}
