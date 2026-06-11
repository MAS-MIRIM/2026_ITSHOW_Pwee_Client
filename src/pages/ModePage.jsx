import styled from "styled-components";

const Section = styled.section`
  position: fixed;
  inset: 0;
  padding: 36px;
  display: grid;
  background: #fffdf2;
  box-sizing: border-box;
  overflow: hidden;
`;

const Frame = styled.section`
  width: 100%;
  min-height: calc(100vh - 72px);
  border: 4px solid #856b6b;
  border-radius: 8px;
  padding: 48px 40px;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 28px;
`;

const Copy = styled.div`
  display: grid;
  gap: 6px;
  justify-items: center;
  text-align: center;
`;

const Title = styled.p`
  color: #856b6b;
  font-size: clamp(1.2rem, 2.6vw, 1.8rem);
  font-weight: 500;
`;

const Subtitle = styled.p`
  color: #856b6b;
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.4;
`;

const ModeGrid = styled.section`
  margin-top: 48px;
  width: min(100%, 420px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const ModeButton = styled.button`
  min-height: 72px;
  padding: 16px 20px;
  border: 2px solid #856b6b;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? "#856b6b" : "#ffffff")};
  color: #856b6b;
  text-align: center;
  cursor: pointer;
  display: grid;
  place-items: center;

  ${({ $active }) =>
    $active &&
    `
      color: #fffdf2;
    `}
`;

const ModeName = styled.strong`
  font-family: 'Suez One', Georgia, serif;
  font-size: 1.4rem;
  letter-spacing: 0.04em;
`;

export function ModePage({ mode, modeContent, onSelect }) {
  return (
    <Section>
      <Frame>
        <Copy>
          <Title>플레이 방식을 선택해주세요</Title>
          <Subtitle>Choose your play mode.</Subtitle>
        </Copy>

        <ModeGrid>
          {Object.keys(modeContent).map((key) => (
            <ModeButton
              key={key}
              type="button"
              $active={mode === key}
              onClick={() => onSelect(key)}
            >
              <ModeName>{key.toUpperCase()}</ModeName>
            </ModeButton>
          ))}
        </ModeGrid>
      </Frame>
    </Section>
  );
}
