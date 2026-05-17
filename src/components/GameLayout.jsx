import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import WebcamSplitView from "./WebcamSplitView";
import MemoCharacterCard from "./MemoCharacterCard";
import ScoreBoard from "./ScoreBoard";
import { useGameSession } from "../context/gameSession";
import { useWebcamCapture } from "../hooks/useWebcamCapture";

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #fffdf2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 48px);
  box-sizing: border-box;
  overflow: hidden;
`;

const Stage = styled.div`
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(16px, 2vw, 26px);
  padding-top: clamp(56px, 7vh, 80px);
`;

const ScoresRow = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: calc(-1 * clamp(18px, 0.5vw, 30px));
`;

const CamFrame = styled.div`
  position: relative;
  width: 100%;
`;

const EndButton = styled.button`
  align-self: center;
  font-family: 'Suez One', Georgia, serif;
  font-size: clamp(14px, 1.6vw, 18px);
  color: #463C3C;
  background: #F8E9C8;
  border: 2px solid #856B6B;
  border-radius: 999px;
  padding: 10px 22px;
  cursor: pointer;

  &:hover { background: #FFE9A8; }
`;

export default function GameLayout() {
  const [scores] = useState({ left: 0, right: 0 });
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const startRef = useRef(null);
  const navigate = useNavigate();
  const { pushCapture, setResult, pickFourCut } = useGameSession();

  useEffect(() => {
    startRef.current = Date.now();
  }, []);

  // Both panes show the same stream; capturing from the left ref is sufficient.
  useWebcamCapture(leftRef, { enabled: true, intervalMs: 3000, onCapture: pushCapture });

  const handleEnd = () => {
    const timeMs = Date.now() - (startRef.current ?? Date.now());
    setResult({ mode: "multi", timeMs, score: { left: scores.left, right: scores.right } });
    pickFourCut();
    navigate("/result");
  };

  return (
    <Page>
      <Stage>
        <CamFrame>
          <WebcamSplitView leftVideoRef={leftRef} rightVideoRef={rightRef} />
          <MemoCharacterCard />
        </CamFrame>
        <ScoresRow>
          <ScoreBoard value={scores.left} />
          <ScoreBoard value={scores.right} />
        </ScoresRow>
        <EndButton type="button" onClick={handleEnd}>게임 종료 (테스트)</EndButton>
      </Stage>
    </Page>
  );
}
