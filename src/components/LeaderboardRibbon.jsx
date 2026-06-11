import styled from "styled-components";
import ribbon from "../assets/leaderboard.svg";

const Wrap = styled.div`
  position: absolute;
  top: clamp(-150px, -12vw, -124px);
  left: clamp(-100px, -10vw, -80px);
  pointer-events: none;
  z-index: 2;
`;

const Img = styled.img`
  display: block;
  width: clamp(360px, 48vw, 620px);
  height: auto;
  filter: drop-shadow(0 6px 10px rgba(133, 107, 107, 0.18));
`;

export default function LeaderboardRibbon() {
  return (
    <Wrap>
      <Img src={ribbon} alt="" />
    </Wrap>
  );
}
