import styled from "styled-components";
import ribbon from "../assets/leaderboard.svg";

const Wrap = styled.div`
  position: absolute;
  top: clamp(-120px, -10vw, -100px);
  left: clamp(-100px, -10vw, -80px);
  pointer-events: none;
  z-index: 2;
`;

const Img = styled.img`
  display: block;
  width: clamp(300px, 40vw, 500px);
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
