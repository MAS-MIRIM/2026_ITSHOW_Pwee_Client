import { CenteredSection, Panel, PrimaryButton, TextInput } from '../styles/ui'

export function NamePage({ nickname, onNext, setNickname }) {
  const canStart = nickname.trim().length > 0

  return (
    <CenteredSection>
      <Panel $width="420px" $borderless>
        <TextInput
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="닉네임 입력"
        />
        <PrimaryButton
          type="button"
          disabled={!canStart}
          onClick={onNext}
        >
          확인
        </PrimaryButton>
      </Panel>
    </CenteredSection>
  )
}
