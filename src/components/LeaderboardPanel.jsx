import styled from "styled-components";
import LeaderboardRibbon from "./LeaderboardRibbon";
import LeaderboardTable from "./LeaderboardTable";

const Panel = styled.div`
  position: relative;
  background: #fffef8;
  border: 2px solid #856b6b;
  border-radius: 18px 18px 0 0;
  width: min(1360px, 100%);
  max-height: min(90vh, 840px);
  padding: clamp(36px, 4.5vw, 72px);
  padding-top: clamp(28px, 4vw, 80px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

export default function LeaderboardPanel({ rankings }) {
  return (
    <Panel>
      <LeaderboardRibbon />
      <LeaderboardTable rankings={rankings} />
    </Panel>
  );
}
