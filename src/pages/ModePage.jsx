import styled from "styled-components";

const Section = styled.section`
  width: 100vw;
  min-height: 100vh;
  padding: 36px;
  display: grid;
  background: #fffdf2;
  margin-left: calc(18% - 25vw);
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
  width: min(100%, 760px);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ModeButton = styled.button`
  min-height: 140px;
  padding: 18px 20px;
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
  font-size: 1.1rem;
  font-weight: 500;
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
          {Object.entries(modeContent).map(([key, item]) => (
            <ModeButton
              key={key}
              type="button"
              $active={mode === key}
              onClick={() => onSelect(key)}
            >
              <ModeName>{item.label}</ModeName>
            </ModeButton>
          ))}
        </ModeGrid>
      </Frame>
    </Section>
  );
}
