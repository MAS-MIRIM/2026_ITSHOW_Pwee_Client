import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useGameSession } from "../context/gameSession";
import { uploadPhoto, sendEmail as apiSendEmail } from "../api/shareApi";
import { composeFourCut } from "../utils/composeFourCut";
import guideImg from "../assets/guide.png";

/* ── design tokens ──────────────────────────────────────────── */
const C = {
  paper: "#faf7f0",
  card: "#fffdf8",
  ink: "#3a2e24",
  inkSoft: "#6f5d49",
  inkFaint: "#a3927c",
  line2: "#e0d3ba",
  coral: "#df8a5f",
  good: "#8ba06a",
};
const MONO = "'Space Mono', ui-monospace, monospace";
const LOGO = "'Space Grotesk', 'Pretendard', sans-serif";
const UI = "'Pretendard', 'Apple SD Gothic Neo', sans-serif";

/* ── SVG marks ──────────────────────────────────────────────── */
function Bunny({ size = 38 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ display: "block" }}
    >
      <ellipse
        cx="18"
        cy="13"
        rx="4.6"
        ry="11"
        fill="#fff"
        stroke={C.ink}
        strokeWidth="1.6"
      />
      <ellipse
        cx="30"
        cy="13"
        rx="4.6"
        ry="11"
        fill="#fff"
        stroke={C.ink}
        strokeWidth="1.6"
      />
      <ellipse cx="18" cy="14" rx="1.8" ry="6" fill="#f0b89a" opacity=".7" />
      <ellipse cx="30" cy="14" rx="1.8" ry="6" fill="#f0b89a" opacity=".7" />
      <circle
        cx="24"
        cy="30"
        r="13"
        fill="#fff"
        stroke={C.ink}
        strokeWidth="1.6"
      />
      <circle cx="19.5" cy="29" r="1.7" fill={C.ink} />
      <circle cx="28.5" cy="29" r="1.7" fill={C.ink} />
      <circle cx="17" cy="33.5" r="2.5" fill="#f0b89a" opacity=".75" />
      <circle cx="31" cy="33.5" r="2.5" fill="#f0b89a" opacity=".75" />
      <circle cx="24" cy="33" r="1.5" fill="#f0b89a" />
    </svg>
  );
}

function Paw({ size = 28, opacity = 1 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ display: "block", opacity }}
    >
      <ellipse cx="20" cy="26" rx="11" ry="9" fill={C.coral} />
      <ellipse cx="9" cy="16" rx="3.6" ry="5" fill={C.coral} />
      <ellipse cx="16" cy="10" rx="3.8" ry="5.4" fill={C.coral} />
      <ellipse cx="24" cy="10" rx="3.8" ry="5.4" fill={C.coral} />
      <ellipse cx="31" cy="16" rx="3.6" ry="5" fill={C.coral} />
    </svg>
  );
}

/* ── Retake Modal (for game strip retake in SharePage) ───────── */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
`;
const ModalBox = styled.div`
  background: #1f1a1a;
  border-radius: 20px;
  overflow: hidden;
  width: min(90vw, 420px);
  display: flex;
  flex-direction: column;
`;
const ModalVideo = styled.video`
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  transform: scaleX(-1);
  display: block;
  background: #000;
`;
const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
`;
const ModalBtn = styled.button`
  flex: 1;
  border-radius: 12px;
  padding: 12px;
  border: none;
  font-family: ${UI};
  font-size: 15px;
  cursor: pointer;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

function RetakeModal({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null,
      cancelled = false;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        await v.play().catch(() => {});
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) setError(err?.message ?? "카메라를 사용할 수 없어요");
      }
    }
    start();
    const videoEl = videoRef.current;
    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (videoEl) videoEl.srcObject = null;
    };
  }, []);

  const capture = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    ctx.save();
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    ctx.restore();
    onCapture(c.toDataURL("image/jpeg", 0.88));
  }, [onCapture]);

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <ModalBox>
        {error ? (
          <div
            style={{
              padding: 24,
              color: "#FFFDF2",
              fontFamily: UI,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        ) : (
          <ModalVideo ref={videoRef} autoPlay muted playsInline />
        )}
        <ModalActions>
          <ModalBtn
            style={{ background: "#F8E9C8", color: "#463C3C" }}
            onClick={onCancel}
          >
            취소
          </ModalBtn>
          <ModalBtn
            style={{ background: "#463C3C", color: "#FFFDF2" }}
            onClick={capture}
            disabled={!ready || !!error}
          >
            📸 찍기
          </ModalBtn>
        </ModalActions>
      </ModalBox>
    </ModalOverlay>
  );
}

/* ── PweeStrip ──────────────────────────────────────────────── */
const StripWrap = styled.div`
  position: relative;
  background: linear-gradient(168deg, #f7e1a0, #f4d27a 55%, #ecc057);
  border-radius: 20px;
  padding: 11px 11px 0;
  box-shadow:
    0 2px 3px rgba(58, 46, 36, 0.1),
    0 24px 44px -22px rgba(120, 90, 30, 0.55);
`;
const Tape = styled.span`
  position: absolute;
  z-index: 4;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.18) 0 5px,
      rgba(255, 255, 255, 0.05) 5px 10px
    ),
    rgba(247, 233, 193, 0.72);
  box-shadow: 0 2px 6px rgba(58, 46, 36, 0.12);
  border-left: 1px dashed rgba(120, 90, 30, 0.22);
  border-right: 1px dashed rgba(120, 90, 30, 0.22);
`;
const StripPhotos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const StripCell = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  background: ${({ $src }) =>
    $src
      ? `url(${$src}) center/cover no-repeat`
      : "repeating-linear-gradient(135deg, #efe6d4 0 9px, #e8ddc7 9px 18px)"};
  &:hover > .cell-retake {
    opacity: 1;
  }
`;
const CellLens = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(58, 46, 36, 0.16);
  &::after {
    content: "";
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: rgba(58, 46, 36, 0.1);
  }
`;
const CellIdx = styled.span`
  position: absolute;
  right: 5px;
  bottom: 4px;
  font-family: ${MONO};
  font-size: 9px;
  color: ${({ $hasSrc }) =>
    $hasSrc ? "rgba(255,255,255,.5)" : "rgba(58,46,36,.32)"};
  pointer-events: none;
`;
const CellRetakeOverlay = styled.div.attrs({ className: "cell-retake" })`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  display: grid;
  place-items: center;
  opacity: 0;
  transition: opacity 0.18s;
  cursor: pointer;
`;
const StripFoot = styled.div`
  text-align: center;
  padding: 10px 0 13px;
  position: relative;
`;
const StripWord = styled.div`
  font-family: ${LOGO};
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.02em;
  color: #6c5326;
`;
const StripDate = styled.div`
  font-family: ${MONO};
  font-size: 9px;
  letter-spacing: 0.14em;
  color: #97712f;
  margin-top: 2px;
`;
const StripPawWrap = styled.span`
  position: absolute;
  right: 12px;
  bottom: 6px;
`;

function PweeStrip({ shots = [], cellH = 110, width = 186, onRetake, label }) {
  const date = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }, []);
  const cells = [0, 1, 2, 3].map((i) => shots[i] ?? null);

  return (
    <StripWrap style={{ width }}>
      <Tape
        style={{
          top: -11,
          left: width * 0.28,
          width: width * 0.44,
          height: 22,
          transform: "rotate(-3deg)",
        }}
      />
      <Tape
        style={{
          bottom: -9,
          right: width * 0.24,
          width: width * 0.4,
          height: 20,
          transform: "rotate(4deg)",
        }}
      />
      {label && (
        <div
          style={{
            position: "absolute",
            top: -28,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: ".16em",
            color: C.inkFaint,
          }}
        >
          {label}
        </div>
      )}
      <StripPhotos>
        {cells.map((src, i) => (
          <StripCell key={i} $src={src} style={{ height: cellH }}>
            {!src && <CellLens />}
            <CellIdx $hasSrc={!!src}>{String(i + 1).padStart(2, "0")}</CellIdx>
            {onRetake && (
              <CellRetakeOverlay onClick={() => onRetake(i)}>
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </CellRetakeOverlay>
            )}
          </StripCell>
        ))}
      </StripPhotos>
      <StripFoot>
        <StripWord>VWEE</StripWord>
        <StripDate>{date}</StripDate>
        <StripPawWrap>
          <Paw size={20} opacity={0.9} />
        </StripPawWrap>
      </StripFoot>
      <span
        style={{
          position: "absolute",
          left: -8,
          top: cellH * 0.62,
          transform: "rotate(-12deg)",
        }}
      >
        <Bunny size={34} />
      </span>
    </StripWrap>
  );
}

/* ── Page shell ─────────────────────────────────────────────── */
const Page = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, #fbf3df 0%, ${C.paper} 46%);
  color: ${C.ink};
  font-family: ${UI};
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(
        440px 320px at 88% -8%,
        rgba(244, 210, 122, 0.2),
        transparent 70%
      ),
      radial-gradient(
        520px 360px at -6% 108%,
        rgba(223, 138, 95, 0.07),
        transparent 72%
      );
  }
`;
const TopBar = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 32px 0;
`;
const NavBtn = styled.button`
  font-family: ${UI};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
  transition:
    transform 0.1s,
    opacity 0.1s;
  &:active {
    transform: translateY(1px);
    opacity: 0.8;
  }
`;
const HomeNavBtn = styled(NavBtn)`
  background: transparent;
  color: ${C.ink};
  border: 1.5px solid rgba(58, 46, 36, 0.25);
  &:hover {
    border-color: ${C.ink};
  }
`;
const RankNavBtn = styled(NavBtn)`
  background: ${C.coral};
  color: #fff;
  border: none;
  &:hover {
    opacity: 0.88;
  }
`;
const Body = styled.div`
  flex: 1;
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 48px;
  padding: 0 60px;
  align-items: center;
  min-height: 0;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    padding: 24px 32px 40px;
    overflow-y: auto;
  }
`;
const HeroCol = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
`;
const StripRow = styled.div`
  display: flex;
  gap: 28px;
  align-items: center;
`;
const GuideHint = styled.img`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: clamp(240px, 26vw, 340px);
  z-index: 50;
  pointer-events: none;
  opacity: 0.92;
`;

/* ── Receipt card ────────────────────────────────────────────── */
const ReceiptOuter = styled.div`
  filter: drop-shadow(0 20px 34px rgba(58, 46, 36, 0.22));
  justify-self: center;
  transform: rotate(2.5deg);
  transform-origin: center top;
`;
const Receipt = styled.div`
  width: 372px;
  background: ${C.card};
  padding: 28px 28px 24px;
  border-radius: 8px;
  mask-image:
    radial-gradient(circle 15px at 0 100%, transparent 14px, #000 14.5px),
    radial-gradient(circle 15px at 100% 100%, transparent 14px, #000 14.5px);
  -webkit-mask-image:
    radial-gradient(circle 15px at 0 100%, transparent 14px, #000 14.5px),
    radial-gradient(circle 15px at 100% 100%, transparent 14px, #000 14.5px);
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
`;
const RHead = styled.div`
  text-align: center;
  margin-bottom: 14px;
`;
const RWordmark = styled.div`
  font-family: ${LOGO};
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 0.14em;
  color: ${C.ink};
`;
const RSub = styled.div`
  font-family: ${MONO};
  font-size: 10px;
  letter-spacing: 0.24em;
  color: ${C.inkFaint};
  margin-top: 2px;
`;
const Dash = styled.div`
  height: 0;
  border-top: 1.5px dashed ${C.line2};
  margin: 11px 0;
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${MONO};
  font-size: 12px;
  padding: 3px 0;
`;
const RKey = styled.span`
  color: ${C.inkSoft};
`;
const RVal = styled.span`
  color: ${C.ink};
`;

const spinKf = keyframes`to { transform: rotate(360deg); }`;
const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid rgba(58, 46, 36, 0.12);
  border-top-color: ${C.inkFaint};
  border-radius: 50%;
  animation: ${spinKf} 0.9s linear infinite;
`;

/* single QR layout */
const QRZone = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;
const QRBox = styled.div`
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: 10px;
  background: #fff;
  display: grid;
  place-items: center;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;
const QRNow = styled.div`
  font-family: ${MONO};
  font-size: 10px;
  letter-spacing: 0.18em;
  color: ${C.inkFaint};
  margin-bottom: 4px;
`;
const QRTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  color: ${C.ink};
`;

/* dual QR layout */
const DualQRGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;
const QRBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;
const QRSmLabel = styled.div`
  font-family: ${MONO};
  font-size: 9px;
  letter-spacing: 0.14em;
  color: ${C.inkFaint};
  text-transform: uppercase;
`;
const QRBoxSm = styled.div`
  width: 82px;
  height: 82px;
  border-radius: 8px;
  background: #fff;
  display: grid;
  place-items: center;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;
const QRCaption = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${C.ink};
  text-align: center;
`;
const RetryBtn = styled.button`
  font-size: 9px;
  font-family: ${MONO};
  color: ${C.inkSoft};
  background: none;
  border: 1px solid ${C.line2};
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;
  margin-top: 2px;
`;

const OrLabel = styled.div`
  font-family: ${MONO};
  font-size: 10px;
  letter-spacing: 0.18em;
  color: ${C.inkFaint};
  margin-bottom: 8px;
`;
const EmailGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid ${({ $error }) => ($error ? C.coral : C.line2)};
  border-radius: 12px;
  padding: 4px 4px 4px 12px;
  background: ${C.paper};
  transition: border-color 0.15s;
  &:focus-within {
    border-color: ${({ $error }) => ($error ? C.coral : C.ink)};
  }
`;
const EmailInput = styled.input`
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 13px;
  font-family: ${UI};
  color: ${C.ink};
  flex: 1;
  min-width: 0;
  outline: none;
  &::placeholder {
    color: ${C.inkFaint};
  }
`;
const SendBtn = styled.button`
  background: ${C.ink};
  color: #fdf7ea;
  border: none;
  border-radius: 9px;
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 700;
  font-family: ${UI};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition:
    transform 0.12s,
    filter 0.15s;
  &:hover:not(:disabled) {
    filter: brightness(1.14);
  }
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
const Hint = styled.p`
  font-size: 11px;
  color: ${({ $ok }) => ($ok ? C.good : C.coral)};
  margin: 5px 0 0;
  font-family: ${UI};
`;
const RFoot = styled.div`
  text-align: center;
  font-family: ${MONO};
  font-size: 11px;
  letter-spacing: 0.1em;
  color: ${C.inkSoft};
`;

/* ── Done screen ─────────────────────────────────────────────── */
const DonePage = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, #fbf3df 0%, ${C.paper} 46%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-family: ${UI};
  color: ${C.ink};
  z-index: 10;
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        440px 320px at 88% -8%,
        rgba(244, 210, 122, 0.2),
        transparent 70%
      ),
      radial-gradient(
        520px 360px at -6% 108%,
        rgba(223, 138, 95, 0.07),
        transparent 72%
      );
  }
`;
const CheckBadge = styled.div`
  position: relative;
  z-index: 1;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${C.good};
  display: grid;
  place-items: center;
`;
const DoneTitle = styled.h2`
  position: relative;
  z-index: 1;
  font-size: 28px;
  font-weight: 800;
  margin: 4px 0 0;
  text-align: center;
`;
const DoneSub = styled.p`
  position: relative;
  z-index: 1;
  font-size: 15px;
  color: ${C.inkSoft};
  text-align: center;
  margin: 0;
`;
const HomeBtn = styled.button`
  position: relative;
  z-index: 1;
  background: ${C.ink};
  color: #fdf7ea;
  border: none;
  border-radius: 999px;
  padding: 16px 36px;
  font-size: 16px;
  font-weight: 700;
  font-family: ${UI};
  cursor: pointer;
  margin-top: 8px;
  transition:
    transform 0.12s,
    filter 0.15s;
  &:hover {
    filter: brightness(1.14);
  }
  &:active {
    transform: translateY(2px);
  }
`;

function ScreenDone({ email, onHome }) {
  const [tick, setTick] = useState(10);
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => {
        if (t <= 1) {
          clearInterval(id);
          onHome();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onHome]);

  return (
    <DonePage>
      <CheckBadge>
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </CheckBadge>
      <DoneTitle>이메일로 전송했어요</DoneTitle>
      <DoneSub>{email} 로 전송되었습니다.</DoneSub>
      <HomeBtn onClick={onHome}>처음으로 · {tick}s</HomeBtn>
    </DonePage>
  );
}

/* ── usePhotoUpload hook ─────────────────────────────────────── */
function usePhotoUpload(imageSource, videoGameId, uploadKey) {
  const [uploadState, setUploadState] = useState({
    imageId: null,
    qrB64: null,
    err: null,
  });

  useEffect(() => {
    if (!imageSource) return;
    let cancelled = false;
    const run = async () => {
      const image =
        typeof imageSource === "function" ? await imageSource() : imageSource;
      if (cancelled) return;
      const res = await uploadPhoto(image, videoGameId);
      if (cancelled) return;
      setUploadState({ imageId: res.image_id, qrB64: res.qr_b64, err: null });
    };
    run().catch((e) => {
      if (!cancelled)
        setUploadState({ imageId: null, qrB64: null, err: e.message });
    });
    return () => {
      cancelled = true;
    };
  }, [imageSource, videoGameId, uploadKey]);

  return {
    imageId: uploadState.imageId,
    qrB64: uploadState.qrB64,
    err: uploadState.err,
  };
}

/* ── Main ────────────────────────────────────────────────────── */
function fmtDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SharePage({ onRestart, onRanking, gameDuration }) {
  const {
    filterShot,
    shareImage,
    videoGameId,
    failShots,
    result,
    updateFailShot,
    fourCutShots,
  } = useGameSession();

  /* game strip */
  const [slots, setSlots] = useState(() => [
    ...(failShots ?? [null, null, null, null]),
  ]);
  const [retakeIndex, setRetakeIndex] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [gameUploadKey, setGameUploadKey] = useState(0);

  const failShotKey = (failShots ?? []).join("|");
  useEffect(() => {
    if (!dirty) setSlots([...(failShots ?? [null, null, null, null])]);
  }, [dirty, failShotKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* fourcut strip */
  const hasFourCutData = fourCutShots?.some(Boolean);
  const [fcUploadKey, setFcUploadKey] = useState(0);

  /* image sources (memoised functions to avoid re-running on unrelated renders) */
  const directImage = shareImage ?? filterShot ?? result?.lifeFourCut;
  const hasGameData = !!(directImage || slots.some(Boolean));

  const gameImageSource = useMemo(() => {
    if (!hasGameData) return null;
    if (directImage) return directImage;
    return () => composeFourCut(slots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directImage, slots.join("|"), gameUploadKey]);

  const fcImageSource = useMemo(() => {
    if (!hasFourCutData) return null;
    return () => composeFourCut(fourCutShots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fourCutShots?.join("|"), fcUploadKey]);

  const {
    imageId: gameImageId,
    qrB64: gameQrB64,
    err: gameUploadErr,
  } = usePhotoUpload(gameImageSource, videoGameId, gameUploadKey);
  const {
    imageId: fcImageId,
    qrB64: fcQrB64,
    err: fcUploadErr,
  } = usePhotoUpload(fcImageSource, videoGameId, fcUploadKey);

  /* retake handler (game strip) */
  const handleCapture = useCallback(
    (dataUrl) => {
      const idx = retakeIndex;
      setRetakeIndex(null);
      setSlots((prev) => {
        const next = [...prev];
        next[idx] = dataUrl;
        return next;
      });
      updateFailShot?.(idx, dataUrl);
      setDirty(true);
      setGameUploadKey((k) => k + 1);
    },
    [retakeIndex, updateFailShot],
  );

  /* receipt counter */
  const [receiptNo] = useState(() => {
    try {
      const n =
        (parseInt(localStorage.getItem("pwee_receipt_no") ?? "0", 10) || 0) + 1;
      localStorage.setItem("pwee_receipt_no", String(n));
      return n;
    } catch {
      return 1;
    }
  });

  /* email */
  const nowStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}  ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }, []);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [sendErr, setSendErr] = useState(null);

  const canSend = !!(gameImageId || fcImageId);

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      if (status === "sending") return;
      const trimmed = email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setEmailError("올바른 이메일 주소를 입력해주세요");
        return;
      }
      setEmailError(null);
      setSendErr(null);
      setStatus("sending");
      try {
        await Promise.all(
          [
            gameImageId && apiSendEmail(trimmed, gameImageId, videoGameId),
            fcImageId && apiSendEmail(trimmed, fcImageId, videoGameId),
          ].filter(Boolean),
        );
        setStatus("sent");
      } catch (err) {
        setStatus("error");
        setSendErr(err.message);
      }
    },
    [email, gameImageId, fcImageId, videoGameId, status],
  );

  if (status === "sent")
    return <ScreenDone email={email.trim()} onHome={onRestart} />;

  /* QR error content */
  function QrError({ onRetry }) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
          padding: 6,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.coral}
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <span
          style={{
            fontSize: 8,
            color: C.coral,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          오류
        </span>
        <RetryBtn onClick={onRetry}>재시도</RetryBtn>
      </div>
    );
  }

  return (
    <Page>
      {retakeIndex !== null && (
        <RetakeModal
          onCapture={handleCapture}
          onCancel={() => setRetakeIndex(null)}
        />
      )}
      <GuideHint src={guideImg} alt="사용 안내" />{" "}
      <TopBar>
        <HomeNavBtn onClick={onRestart}>← 홈으로</HomeNavBtn>
        <RankNavBtn onClick={onRanking}>랭킹 보기 →</RankNavBtn>
      </TopBar>
      <Body>
        {/* ── Left: strips ── */}
        <HeroCol>
          <StripRow>
            <div
              style={{
                transform: "rotate(-5deg)",
                flexShrink: 0,
                paddingTop: 16,
              }}
            >
              <PweeStrip
                shots={slots}
                cellH={128}
                width={216}
                onRetake={setRetakeIndex}
                label="GAME"
              />
            </div>
            {hasFourCutData && (
              <div
                style={{
                  transform: "rotate(4deg)",
                  flexShrink: 0,
                  marginTop: 24,
                }}
              >
                <PweeStrip
                  shots={fourCutShots}
                  cellH={128}
                  width={216}
                  label="vwee"
                />
              </div>
            )}
          </StripRow>
        </HeroCol>

        {/* ── Right: receipt ── */}
        <ReceiptOuter>
          <Receipt>
            <RHead>
              <RWordmark>VWEE</RWordmark>
              <RSub>PHOTO BOOTH · RECEIPT</RSub>
            </RHead>

            <Dash />
            <Row>
              <RKey>BOOTH</RKey>
              <RVal>No. {String(receiptNo).padStart(3, "0")}</RVal>
            </Row>
            <Row>
              <RKey>DATE</RKey>
              <RVal>{nowStr}</RVal>
            </Row>
            {gameDuration != null && (
              <Row>
                <RKey>TIME</RKey>
                <RVal>{fmtDuration(gameDuration)}</RVal>
              </Row>
            )}
            <Dash />

            {/* QR section — single or dual depending on available strips */}
            {hasFourCutData ? (
              <DualQRGrid>
                {/* Game shots QR */}
                <QRBlock>
                  <QRSmLabel>GAME SHOTS</QRSmLabel>
                  <QRBoxSm>
                    {gameUploadErr ? (
                      <QrError onRetry={() => setGameUploadKey((k) => k + 1)} />
                    ) : gameQrB64 ? (
                      <img
                        src={`data:image/png;base64,${gameQrB64}`}
                        alt="게임 QR"
                      />
                    ) : (
                      <Spinner style={{ width: 28, height: 28 }} />
                    )}
                  </QRBoxSm>
                  <QRCaption>게임네컷</QRCaption>
                </QRBlock>

                {/* FourCut shots QR */}
                <QRBlock>
                  <QRSmLabel>FILTER PHOTOS</QRSmLabel>
                  <QRBoxSm>
                    {fcUploadErr ? (
                      <QrError onRetry={() => setFcUploadKey((k) => k + 1)} />
                    ) : fcQrB64 ? (
                      <img
                        src={`data:image/png;base64,${fcQrB64}`}
                        alt="네컷 QR"
                      />
                    ) : (
                      <Spinner style={{ width: 28, height: 28 }} />
                    )}
                  </QRBoxSm>
                  <QRCaption>쁘이네컷</QRCaption>
                </QRBlock>
              </DualQRGrid>
            ) : (
              <QRZone>
                <QRBox>
                  {gameUploadErr ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 5,
                        padding: 7,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={C.coral}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4M12 16h.01" />
                      </svg>
                      <span
                        style={{
                          fontSize: 9,
                          color: C.coral,
                          textAlign: "center",
                          lineHeight: 1.4,
                        }}
                      >
                        업로드 실패
                      </span>
                      <RetryBtn onClick={() => setGameUploadKey((k) => k + 1)}>
                        재시도
                      </RetryBtn>
                    </div>
                  ) : gameQrB64 ? (
                    <img
                      src={`data:image/png;base64,${gameQrB64}`}
                      alt="QR 코드"
                    />
                  ) : (
                    <Spinner />
                  )}
                </QRBox>
                <div>
                  <QRNow>NOW</QRNow>
                  <QRTitle>
                    QR 스캔으로
                    <br />
                    즉시 저장
                  </QRTitle>
                </div>
              </QRZone>
            )}

            <Dash style={{ margin: "13px 0 11px" }} />
            <OrLabel>OR · KEEP A COPY</OrLabel>

            <form onSubmit={handleSend}>
              <EmailGroup $error={!!emailError}>
                <EmailInput
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                    setSendErr(null);
                  }}
                  disabled={status === "sending" || !canSend}
                />
                <SendBtn
                  type="submit"
                  disabled={status === "sending" || !canSend}
                >
                  {status === "sending" ? "전송 중…" : "전송"}
                </SendBtn>
              </EmailGroup>
              {hasFourCutData && canSend && (
                <Hint $ok>게임네컷 + 쁘이네컷 모두 전송됩니다</Hint>
              )}
              {emailError && <Hint>{emailError}</Hint>}
              {status === "error" && sendErr && <Hint>{sendErr}</Hint>}
            </form>

            <Dash />
            <RFoot>THANK YOU · SEE YOU AGAIN ♡</RFoot>
          </Receipt>
        </ReceiptOuter>
      </Body>
    </Page>
  );
}
