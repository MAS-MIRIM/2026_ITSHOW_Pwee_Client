import {
  ActionsRow,
  CaptureCard,
  CaptureGrid,
  FillPanel,
  GridSection,
  PrimaryButton,
  QRBox,
  SecondaryButton,
} from '../styles/ui'

export function SharePage({ captureCards, onRestart }) {
  return (
    <GridSection>
      <FillPanel $borderless>
        <CaptureGrid>
          {captureCards.map((item) => (
            <CaptureCard key={item}>
              {item}
            </CaptureCard>
          ))}
        </CaptureGrid>
      </FillPanel>

      <FillPanel $borderless>
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
      </FillPanel>
    </GridSection>
  )
}
