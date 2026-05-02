import styled from 'styled-components'

const Section = styled.section`
  min-height: inherit;
  display: grid;
  place-items: center;
`

const Panel = styled.article`
  width: min(100%, 420px);
  display: grid;
  gap: 16px;
`

const TextInput = styled.input`
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

const Button = styled.button`
  border-radius: 12px;
  padding: 14px 16px;
  border: 2px solid #856b6b;
  background: #856b6b;
  color: #fffdf2;
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

export function NamePage({ nickname, onNext, setNickname }) {
  const canStart = nickname.trim().length > 0

  return (
    <Section>
      <Panel>
        <TextInput
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="닉네임 입력"
        />
        <Button
          type="button"
          disabled={!canStart}
          onClick={onNext}
        >
          확인
        </Button>
      </Panel>
    </Section>
  )
}
