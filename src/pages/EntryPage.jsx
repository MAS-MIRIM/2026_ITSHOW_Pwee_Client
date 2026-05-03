import styled from "styled-components";
import ribbonImage from "../assets/ribbon.svg";

const Section = styled.section`
  width: 100%;
  min-height: 100vh;
  background: #fffdf2;
  display: grid;
  place-items: center;
  overflow: hidden;
`;

const Panel = styled.article`
  width: min(100%, 640px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding-top: 36px;
  transform: translateY(20px);
`;

const Bunny = styled.div`
  position: relative;
  width: 380px;
  height: 340px;
`;

const Ear = styled.div`
  position: absolute;
  top: -100px;
  width: 90px;
  height: 140px;
  border: 2px solid #856b6b;
  border-bottom: none;
  border-radius: 999px 999px 0 0;
  background: transparent;

  &::after {
    content: "";
    position: absolute;
    top: 28px;
    left: 22px;
    width: 42px;
    height: 110px;
    background: #ebab90;
    border-radius: 999px 999px 0 0;
  }
`;

const LeftEar = styled(Ear)`
  left: 34px;
`;

const RightEar = styled(Ear)`
  right: 34px;
`;

const Eye = styled.div`
  position: absolute;
  top: 112px;
  width: 48px;
  height: 48px;
  background: #856b6b;
  border-radius: 50%;
`;

const LeftEye = styled(Eye)`
  left: 270px;
`;

const RightEye = styled(Eye)`
  right: 270px;
`;

const Nose = styled.div`
  position: absolute;
  top: 146px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 30px;
  background: #856b6b;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
  border-radius: 50% 50% 0 50%;
`;

const Mouth = styled.svg`
  position: absolute;
  top: 183px;
  left: 50%;
  transform: translateX(-50%);
  width: 144px;
  height: 46px;
`;

const Cheek = styled.div`
  position: absolute;
  top: 155px;
  width: 64px;
  height: 40px;
  background: #ebab90;
  border-radius: 50%;
  filter: blur(1px);
`;

const LeftCheek = styled(Cheek)`
  left: -20px;
`;

const RightCheek = styled(Cheek)`
  right: -20px;
`;

const Paw = styled.div`
  position: absolute;
  top: 108px;
  width: 86px;
  height: 156px;
  border: 3px solid #856b6b;
  border-bottom: none;
  border-left: none;
  border-radius: 999px 999px 0 0;
`;

const RightPaw = styled(Paw)`
  right: -160px;
  transform: rotate(31deg);
  position: absolute;
  width: 100px;
  height: 140px;
  border: 2px solid #856b6b;
  border-bottom: none;
  border-radius: 999px 999px 0 0;
  background: transparent;

  &::before {
    content: "";
    position: absolute;
    top: 40px;
    left: 24px;
    width: 50px;
    height: 50px;
    background: #ebab90;
    border-radius: 50%;
  }

  &::after {
    content: "";
    position: absolute;
    top: 24px;
    left: 12px;
    width: 14px;
    height: 14px;
    background: #ebab90;
    border-radius: 50%;
    box-shadow:
      18px -10px 0 #ebab90,
      40px -6px 0 #ebab90,
      60px 4px 0 #ebab90;
  }
`;

const LeftHand = styled.div`
  position: absolute;
  left: -110px;
  top: 206px;
  width: 100px;
  height: 140px;
  border: 2px solid #856b6b;
  border-top: none;
  border-radius: 0 0 99% 99%;
  background: transparent;
  transform: rotate(-30deg);
  z-index: 3;

  &::after {
    content: "";
    position: absolute;
    top: 5.4px;
    left: 2px;
    width: 94px;
    height: 132px;
    background: #fffdf2;
    border-radius: 0 0 99% 99%;
    z-index: -1;
  }
`;

const Ribbon = styled.img`
  position: absolute;
  top: 240px;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: auto;
  display: block;
  z-index: 1;
`;

const RibbonText = styled.span`
  position: absolute;
  top: 285px;
  left: 52.5%;
  transform: translateX(-50%) rotate(-4deg);
  z-index: 2;
  color: #856b6b;
  font-family: "Gruppo", sans-serif;
  font-size: 74px;
  font-weight: 400;
  letter-spacing: 6px;
  line-height: 1;
  pointer-events: none;
`;

const Button = styled.button`
  width: 100%;
  height: 78px;
  border-radius: 999px;
  border: 4px solid #856b6b;
  background: #fffdf2;
  color: #856b6b;
  font-family: "Suez One", serif;
  font-size: 21px;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 3px solid #856b6b;
    outline-offset: 2px;
  }
`;

const StartButton = styled(Button)`
  margin-top: 64px;
`;

export function EntryPage({ onRanking, onStart }) {
  return (
    <Section>
      <Panel>
        <Bunny>
          <LeftEar />
          <RightEar />

          <LeftEye />
          <RightEye />

          <Nose />
          <Mouth viewBox="0 0 144 46" aria-hidden="true">
            <path
              d="M10 10 C30 38, 114 38, 134 10"
              fill="none"
              stroke="#856b6b"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </Mouth>

          <LeftCheek />
          <RightCheek />

          <RightPaw />
          <LeftHand />

          <Ribbon src={ribbonImage} alt="" aria-hidden="true" />
          <RibbonText>VWEE</RibbonText>
        </Bunny>

        <StartButton type="button" onClick={onStart}>
          PLAY
        </StartButton>

        <Button type="button" onClick={onRanking}>
          RANKING
        </Button>
      </Panel>
    </Section>
  );
}
