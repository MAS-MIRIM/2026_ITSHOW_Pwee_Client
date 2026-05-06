import { useEffect, useState } from "react";
import styled from "styled-components";
import cameraIcon from "../assets/camera.svg";
import faceIcon from "../assets/face.svg";

const GUIDE_DURATION_MS = 3000;
const GUIDE_FADE_DURATION_MS = 600;

const Section = styled.section`
  min-height: inherit;
  display: grid;
  place-items: center;
`;

const Panel = styled.article`
  width: min(100%, 860px);
  display: grid;
  gap: 36px;
  justify-items: center;
  align-content: center;
  text-align: center;
`;

const MessageFrame = styled.div`
  opacity: ${({ $fading }) => ($fading ? 0 : 1)};
  transition: opacity 600ms ease;
  display: grid;
  gap: 36px;
  justify-items: center;
`;

const Message = styled.div`
  margin-top: 24px;
  display: grid;
  gap: 8px;
  justify-items: center;
`;

const KoreanMessage = styled.strong`
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
`;

const EnglishMessage = styled.strong`
  font-size: clamp(1.2rem, 2.8vw, 1.6rem);
  font-weight: 500;
  line-height: 1.35;
  text-align: center;
`;

const IconBadge = styled.div`
  width: 188px;
  height: 188px;
  border-radius: 50%;
  background: #856b6b;
  display: grid;
  place-items: center;
`;

const Icon = styled.img`
  width: 96px;
  height: 96px;
  object-fit: contain;
`;

export function GuidePage({ message, onNext, step }) {
  const [isFading, setIsFading] = useState(false);
  const [koreanMessage, englishMessage = ""] = message.split("\n");
  const iconSource = step === 0 ? cameraIcon : faceIcon;

  useEffect(() => {
    setIsFading(false);

    const fadeTimer = window.setTimeout(() => {
      setIsFading(true);
    }, GUIDE_DURATION_MS - GUIDE_FADE_DURATION_MS);

    const nextTimer = window.setTimeout(() => {
      onNext();
    }, GUIDE_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(nextTimer);
    };
  }, [message, onNext]);

  return (
    <Section>
      <Panel>
        <MessageFrame $fading={isFading}>
          <IconBadge>
            <Icon src={iconSource} alt="" aria-hidden="true" />
          </IconBadge>
          <Message>
            <KoreanMessage>{koreanMessage}</KoreanMessage>
            <EnglishMessage>{englishMessage}</EnglishMessage>
          </Message>
        </MessageFrame>
      </Panel>
    </Section>
  );
}
