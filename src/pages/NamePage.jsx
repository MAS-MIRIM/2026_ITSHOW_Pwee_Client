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

const Frame = styled.form`
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

const TextInput = styled.input`
  margin-top: 48px;
  width: min(100%, 520px);
  padding: 18px 20px;
  border: 2px solid #856b6b;
  border-radius: 6px;
  background: #ffffff;
  color: #856b6b;
  font-size: 1.1rem;

  &::placeholder {
    color: #856b6b;
    opacity: 0.62;
  }

  &:focus {
    outline: none;
  }
`;

export function NamePage({ nickname, onNext, setNickname }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <Section>
      <Frame onSubmit={handleSubmit}>
        <Copy>
          <Title>게임 내에서 사용할 닉네임을 입력해주세요</Title>
          <Subtitle>Type your name please.</Subtitle>
        </Copy>
        <TextInput
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="닉네임 입력"
          autoFocus
        />
      </Frame>
    </Section>
  );
}
