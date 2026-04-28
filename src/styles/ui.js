import styled, { createGlobalStyle, css } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
    font-family:
      'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Segoe UI', sans-serif;
    line-height: 1.5;
    font-weight: 400;
    color: #856b6b;
    background: #fffdf2;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background: #fffdf2;
  }

  button,
  input {
    font: inherit;
  }

  button {
    appearance: none;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
`

export const AppShell = styled.main`
  width: min(100%, 960px);
  margin: 0 auto;
  padding: 24px 16px 40px;
`

export const PageFrame = styled.section`
  min-height: calc(100vh - 64px);
  display: grid;
  place-items: center;
`

export const CenteredSection = styled.section`
  min-height: inherit;
  display: grid;
  place-items: center;
`

export const GridSection = styled.section`
  min-height: inherit;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

export const Panel = styled.article`
  width: min(100%, ${({ $width = '520px' }) => $width});
  padding: 24px;
  display: grid;
  gap: ${({ $gap = '16px' }) => $gap};
  background: #fffdf2;
  border: ${({ $borderless }) => ($borderless ? 'none' : '1px solid rgba(133, 107, 107, 0.22)')};
  border-radius: 16px;
  box-shadow: none;
`

export const FillPanel = styled(Panel)`
  width: 100%;
`

const buttonBase = css`
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(133, 107, 107, 0.22);
  background: #fffdf2;
  color: #856b6b;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid rgba(133, 107, 107, 0.45);
    outline-offset: 2px;
  }
`

export const PrimaryButton = styled.button`
  ${buttonBase};
  background: #856b6b;
  border-color: #856b6b;
  color: #fffdf2;
`

export const SecondaryButton = styled.button`
  ${buttonBase};
`

export const TextInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  background: #fffdf2;
  color: #856b6b;
  box-shadow: inset 0 0 0 1px rgba(133, 107, 107, 0.12);

  &:focus-visible {
    outline: 2px solid rgba(133, 107, 107, 0.45);
    outline-offset: 2px;
  }
`

export const Column = styled.div`
  display: grid;
  gap: ${({ $gap = '12px' }) => $gap};
`

export const CenteredColumn = styled(Column)`
  justify-items: center;
  align-content: center;
  text-align: center;
`

export const ActionsRow = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`

export const ModeGrid = styled.section`
  width: min(100%, 640px);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

export const ModeButton = styled.button`
  min-height: 160px;
  padding: 24px 20px;
  border: 1px solid ${({ $active }) => ($active ? '#856b6b' : 'rgba(133, 107, 107, 0.22)')};
  border-radius: 16px;
  background: ${({ $active }) => ($active ? 'rgba(133, 107, 107, 0.08)' : '#fffdf2')};
  color: #856b6b;
  text-align: left;
  cursor: pointer;
`

export const ModeName = styled.strong`
  font-size: 1.25rem;
  font-weight: 700;
`

export const GuideMessage = styled.strong`
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  line-height: 1.4;
  text-align: center;
`

export const RankingList = styled.div`
  display: grid;
  gap: 10px;
`

export const RankingItem = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  background: rgba(133, 107, 107, 0.05);
`

export const ResultPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

export const MetricBox = styled.div`
  padding: 16px;
  border: none;
  border-radius: 12px;
  display: grid;
  gap: 4px;
  background: rgba(133, 107, 107, 0.05);
`

export const MetricLabel = styled.p`
  color: rgba(133, 107, 107, 0.82);
  font-size: 0.95rem;
`

export const MetricValue = styled.strong`
  font-size: 1.5rem;
  line-height: 1.2;
`

export const PlaceholderPanel = styled(FillPanel)`
  min-height: 240px;
  place-content: center;
`

export const CaptureGrid = styled.div`
  display: grid;
  gap: 12px;
`

export const CaptureCard = styled.div`
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: rgba(133, 107, 107, 0.04);
`

export const QRBox = styled.div`
  min-height: 180px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 12px;
  background: rgba(133, 107, 107, 0.04);
  font-weight: 600;
`
