import {
  CenteredColumn,
  CenteredSection,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from "../styles/ui";

export function EntryPage({ onRanking, onStart }) {
  return (
    <CenteredSection>
      <Panel as={CenteredColumn} $width="420px" $gap="12px" $borderless>
        <SecondaryButton type="button" onClick={onStart}>
          Play
        </SecondaryButton>
        <SecondaryButton type="button" onClick={onRanking}>
          Ranking
        </SecondaryButton>
      </Panel>
    </CenteredSection>
  );
}
