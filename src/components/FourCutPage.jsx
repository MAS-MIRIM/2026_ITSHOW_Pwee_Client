import { useCallback, useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { useGameSession } from "../context/gameSession";
import { composeFourCut } from "../utils/composeFourCut";
import { getFaceLandmarker, LANDMARK } from "../utils/faceLandmarker";
import frameImg from "../assets/frame.png";
import tape from "../assets/tape.svg";
import bunnyUrl from "../assets/filters/bunny-ears.svg";
import glassesUrl from "../assets/filters/glasses.svg";
import heartUrl from "../assets/filters/heart.svg";

const FILTERS = [
  { id: "none",    label: "없음",    emoji: "✕" },
  { id: "bunny",   label: "토끼 귀", emoji: "🐰" },
  { id: "glasses", label: "안경",    emoji: "👓" },
  { id: "heart",   label: "하트",    emoji: "💗" },
];
const SHOT_COUNT    = 4;
const COUNTDOWN_SEC = 10;

/* ── helpers ─────────────────────────────────────────────────── */
function loadSticker(url) {
  return new Promise(res => {
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => res(img); img.onerror = () => res(null); img.src = url;
  });
}

function drawStickers(ctx, landmarks, filter, stickers, w, h) {
  if (!landmarks || filter === "none") return;
  const nose      = landmarks[LANDMARK.noseTip];
  const leftEye   = landmarks[LANDMARK.leftEyeOuter];
  const rightEye  = landmarks[LANDMARK.rightEyeOuter];
  const forehead  = landmarks[LANDMARK.foreheadTop];
  if (!nose || !leftEye || !rightEye || !forehead) return;

  const eyeDx   = (rightEye.x - leftEye.x) * w;
  const eyeDy   = (rightEye.y - leftEye.y) * h;
  const eyeW    = Math.hypot(eyeDx, eyeDy);
  const angle   = Math.atan2(eyeDy, eyeDx);

  if (filter === "bunny" && stickers.bunny) {
    const eW = eyeW * 2;
    const eH = eW * (stickers.bunny.naturalHeight / stickers.bunny.naturalWidth);
    const fx = forehead.x * w, fy = forehead.y * h - eH * 1.1;
    ctx.save(); ctx.translate(fx, fy + eH / 2); ctx.rotate(angle);
    ctx.drawImage(stickers.bunny, -eW / 2, -eH / 2, eW, eH); ctx.restore();
  }
  if (filter === "glasses" && stickers.glasses) {
    const gW = eyeW * 2, gH = gW * (200 / 380);
    const cx = ((leftEye.x + rightEye.x) / 2) * w;
    const cy = ((leftEye.y + rightEye.y) / 2) * h + eyeW * 0.04;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    ctx.drawImage(stickers.glasses, -gW / 2, -gH / 2, gW, gH); ctx.restore();
  }
  if (filter === "heart" && stickers.heart) {
    const hS = eyeW * 0.72;
    const lc = { x: leftEye.x  * w - eyeW * 0.18, y: leftEye.y  * h + eyeW * 0.62 };
    const rc = { x: rightEye.x * w + eyeW * 0.18, y: rightEye.y * h + eyeW * 0.62 };
    ctx.save(); ctx.translate(lc.x, lc.y); ctx.rotate(angle - 0.18);
    ctx.drawImage(stickers.heart, -hS/2, -hS/2, hS, hS); ctx.restore();
    ctx.save(); ctx.translate(rc.x, rc.y); ctx.rotate(angle + 0.18);
    ctx.drawImage(stickers.heart, -hS/2, -hS/2, hS, hS); ctx.restore();
  }
}

/* ── animations ──────────────────────────────────────────────── */
const spin     = keyframes`to { transform: rotate(360deg); }`;
const popIn    = keyframes`0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1}`;
const flashKf  = keyframes`0%{opacity:.9} 100%{opacity:0}`;
const slideUp  = keyframes`from{transform:translateY(18px);opacity:0} to{transform:translateY(0);opacity:1}`;

/* ── styled components ───────────────────────────────────────── */
const Page = styled.div`
  position: fixed; inset: 0; background: #fffdf2;
  padding: clamp(18px, 4vw, 40px); box-sizing: border-box; overflow: hidden;
`;
const Stage = styled.div`
  width: min(100%, 980px); min-height: 100%; margin: 0 auto;
  display: grid; grid-template-columns: 1fr minmax(280px, 400px);
  align-items: center; gap: clamp(14px, 2.8vw, 32px);
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;
const PreviewPane = styled.section`
  display: flex; align-items: center; justify-content: center;
  order: 1; @media (max-width: 760px) { order: 1; }
`;
const ControlPane = styled.section`
  width: min(100%, 400px); display: grid; gap: 18px;
  order: 2; @media (max-width: 760px) { order: 2; }
`;

/* camera */
const CamWrap = styled.div`
  position: relative; width: 100%; aspect-ratio: 4/3;
  border-radius: 22px; background: #111; overflow: hidden;
  box-shadow: 0 14px 32px rgba(31,26,26,.18);
`;
const CamVideo = styled.video`
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; transform: scaleX(-1);
`;
const CamOverlay = styled.canvas`
  position: absolute; inset: 0; width: 100%; height: 100%;
  transform: scaleX(-1); pointer-events: none;
`;
const Spinner = styled.div`
  width: 28px; height: 28px; border-radius: 50%;
  border: 3px solid rgba(255,253,242,.22); border-top-color: #f8e9c8;
  animation: ${spin} .9s linear infinite;
`;
const StatusOverlay = styled.div`
  position: absolute; inset: 0; border-radius: 22px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  background: ${({ $error }) => $error ? "rgba(80,20,20,.88)" : "rgba(22,18,18,.78)"};
  color: #fffdf2; font-family: "Pretendard", sans-serif; text-align: center;
  padding: 20px; z-index: 5;
  .label { font-size: clamp(13px, 1.5vw, 16px); letter-spacing: .06em; }
  .detail { font-size: 12px; color: #dcc9a8; max-width: 300px; }
`;
const FlashLayer = styled.div`
  position: absolute; inset: 0; background: #fff; z-index: 10; pointer-events: none;
  animation: ${flashKf} .35s ease-out forwards;
`;
const CamCountdown = styled.div`
  position: absolute; inset: 0; z-index: 8; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px; pointer-events: none;
`;
const ShotBadge = styled.div`
  background: rgba(22,18,18,.72); color: #f8e9c8; border-radius: 999px;
  padding: 5px 14px; font-family: "Space Mono", monospace; font-size: 13px;
  letter-spacing: .1em;
`;
const CountNum = styled.div`
  font-size: clamp(64px, 10vw, 96px); font-weight: 900; line-height: 1;
  color: ${({ $shoot }) => $shoot ? "#f4d27a" : "#fff"};
  font-family: "Space Grotesk", "Pretendard", sans-serif;
  text-shadow: 0 4px 20px rgba(0,0,0,.4);
  animation: ${popIn} .3s ease-out;
`;

/* frame preview (done) */
const FrameWrap = styled.div`
  --fs: 0.34825;
  --fh: min(70vh, calc((100vw - 32px) / var(--fs)), 800px);
  position: relative;
  width: calc(var(--fh) * var(--fs));
  height: var(--fh);
  aspect-ratio: 1906 / 5473;
`;
const FrameInner = styled.div`
  position: absolute; inset: 0; border-radius: 16px; overflow: hidden;
  img.base { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1; }
  img.composed { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; z-index: 2; }
`;
const TapeTop = styled.img`
  position: absolute; width: clamp(80px,12vw,120px); top: -14px; left: 50%;
  transform: translateX(-50%) rotate(-4deg); z-index: 3;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,.12));
`;
const TapeCorner = styled.img`
  position: absolute; width: clamp(60px,9vw,88px); bottom: -10px;
  ${({ $side }) => $side === "left"
    ? "left:-16px;transform:rotate(-26deg);"
    : "right:-16px;transform:rotate(26deg);"}
  z-index: 3; filter: drop-shadow(0 3px 4px rgba(0,0,0,.12));
`;

/* controls */
const Heading = styled.h1`
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
  font-size: clamp(30px,4.5vw,50px); color: #463c3c; margin: 0; letter-spacing: -.01em;
`;
const SubLine = styled.p`
  font-family: "Pretendard", sans-serif; color: #856b6b;
  font-size: clamp(12px,1.3vw,14px); margin: -8px 0 0; letter-spacing: .18em; text-transform: uppercase;
`;
const Desc = styled.p`
  font-family: "Pretendard", sans-serif; font-size: clamp(13px,1.4vw,15px);
  color: #856b6b; line-height: 1.65; margin: 0;
`;
const FilterRow = styled.div`
  display: flex; gap: 6px; padding: 6px; border-radius: 12px; background: #f5efe7;
`;
const filterPop = keyframes`
  0%{transform:scale(.9);opacity:.4} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1}
`;
const Chip = styled.button`
  flex: 1; font-family: "Pretendard", sans-serif; font-size: clamp(12px,1.2vw,14px);
  font-weight: 800; border-radius: 8px; min-height: 40px; border: none;
  background: ${({ $active }) => $active ? "#463C3C" : "transparent"};
  color: ${({ $active }) => $active ? "#FFFDF2" : "#463C3C"};
  cursor: pointer; transition: transform .1s;
  &:active { transform: scale(.95); }
  &:disabled { opacity: .4; cursor: not-allowed; }
  ${({ $active }) => $active && css`animation: ${filterPop} .22s ease-out;`}
`;
const CaptureStatus = styled.div`
  display: grid; gap: 8px;
  animation: ${slideUp} .2s ease-out;
`;
const StatusLine = styled.div`
  font-family: "Space Mono", monospace; font-size: 13px; color: #856b6b; letter-spacing: .08em;
`;
const BigCount = styled.div`
  font-size: 72px; font-weight: 900; line-height: 1;
  font-family: "Space Grotesk", "Pretendard", sans-serif; color: #463c3c;
  animation: ${popIn} .25s ease-out;
`;
const Actions = styled.div` display: grid; gap: 10px; padding-top: 4px; `
const Btn = styled.button`
  font-family: "Pretendard", sans-serif; font-size: clamp(15px,1.6vw,17px); font-weight: 800;
  border-radius: 12px; min-height: 56px; padding: 0 18px; cursor: pointer; border: none;
  transition: transform .12s, box-shadow .12s;
  &.primary { background:#463c3c; color:#fffdf2; box-shadow:0 4px 0 #1f1717,0 10px 16px rgba(70,60,60,.16); }
  &.secondary { background:#fff; color:#463c3c; border:1.5px solid rgba(133,107,107,.22); box-shadow:0 4px 0 #e7ddd1; }
  &:active { transform:translateY(2px); box-shadow:none; }
  &:disabled { opacity:.45; cursor:not-allowed; }
`;

/* ── Main component ──────────────────────────────────────────── */
// phase: 'loading' | 'ready' | 'capturing' | 'composing' | 'done'
export default function FourCutPage({ onNext }) {
  const { updateFourCutShot } = useGameSession();

  const [phase,       setPhase]     = useState("loading");
  const [cameraError, setCamErr]    = useState(null);
  const [modelReady,  setModelReady] = useState(false);
  const [filter,      setFilter]    = useState("bunny");
  const [shotIndex,   setShotIndex] = useState(0);   // 0-based current shot
  const [countdown,   setCountdown] = useState(null); // 3,2,1,0=shoot,null=pause
  const [flash,       setFlash]     = useState(false);
  const [composedSrc, setComposed]  = useState(null);

  const videoRef    = useRef(null);
  const overlayRef  = useRef(null);
  const rafRef      = useRef(0);
  const landmarkerRef  = useRef(null);
  const stickersRef    = useRef({});
  const lastLmRef      = useRef([]);
  const filterRef      = useRef("bunny");
  const abortRef       = useRef(false);

  /* Phase A: camera */
  useEffect(() => {
    let stream = null, cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(s => {
        stream = s;
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
        const v = videoRef.current; if (!v) return;
        v.srcObject = s;
        return v.play().catch(() => {});
      })
      .then(() => { if (!cancelled) setPhase("ready"); })
      .catch(err => {
        if (!cancelled) setCamErr(err?.message ?? "카메라 오류");
      });
    const el = videoRef.current;
    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (el) el.srcObject = null;
    };
  }, []);

  /* Phase B: AR model + stickers */
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getFaceLandmarker().catch(() => null),
      loadSticker(bunnyUrl), loadSticker(glassesUrl), loadSticker(heartUrl),
    ]).then(([lm, bunny, glasses, heart]) => {
      if (cancelled) return;
      landmarkerRef.current = lm;
      stickersRef.current = { bunny, glasses, heart };
      setModelReady(true);
    }).catch(() => { if (!cancelled) setModelReady(true); });
    return () => { cancelled = true; };
  }, []);

  /* Phase C: render loop */
  useEffect(() => {
    if (phase === "loading" || phase === "done" || phase === "composing") return;
    let cancelled = false;
    const v = videoRef.current, ov = overlayRef.current;
    if (!v || !ov) return;
    const ctx = ov.getContext("2d");
    const loop = () => {
      if (cancelled) return;
      if (v.readyState >= 2 && v.videoWidth) {
        if (ov.width !== v.videoWidth) ov.width = v.videoWidth;
        if (ov.height !== v.videoHeight) ov.height = v.videoHeight;
        ctx.clearRect(0, 0, ov.width, ov.height);
        const lm = landmarkerRef.current;
        if (lm) {
          try { lastLmRef.current = lm.detectForVideo(v, performance.now())?.faceLandmarks ?? []; } catch (_) { /* keep last */ }
          lastLmRef.current.forEach(lms => drawStickers(ctx, lms, filterRef.current, stickersRef.current, ov.width, ov.height));
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelled = true; cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  useEffect(() => { filterRef.current = filter; }, [filter]);
  useEffect(() => () => { abortRef.current = true; }, []);

  /* Capture one frame from video + overlay */
  const captureFrame = useCallback(() => {
    const v = videoRef.current, ov = overlayRef.current;
    if (!v || !v.videoWidth) return null;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    ctx.save(); ctx.translate(c.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    if (ov) ctx.drawImage(ov, 0, 0);
    ctx.restore();
    return c.toDataURL("image/jpeg", 0.88);
  }, []);

  /* Sequential auto-capture: 4 shots with countdown */
  const startCapture = useCallback(async () => {
    abortRef.current = false;
    setPhase("capturing");
    const frames = [];

    for (let i = 0; i < SHOT_COUNT; i++) {
      if (abortRef.current) return;
      setShotIndex(i);

      for (let s = COUNTDOWN_SEC; s >= 1; s--) {
        if (abortRef.current) return;
        setCountdown(s);
        await new Promise(r => setTimeout(r, 1000));
      }
      if (abortRef.current) return;

      setCountdown(0); // "찰칵!" moment
      const frame = captureFrame();
      if (frame) { frames.push(frame); updateFourCutShot(i, frame); }

      setFlash(true);
      await new Promise(r => setTimeout(r, 300));
      setFlash(false);

      if (i < SHOT_COUNT - 1) {
        setCountdown(null);
        await new Promise(r => setTimeout(r, 700));
      }
    }

    if (abortRef.current) return;
    setCountdown(null);
    setPhase("composing");
    const result = await composeFourCut(frames);
    if (abortRef.current) return;
    setComposed(result);
    setPhase("done");
  }, [captureFrame, updateFourCutShot]);

  const retake = useCallback(() => {
    setPhase("ready");
    setComposed(null);
    setShotIndex(0);
    setCountdown(null);
    setFlash(false);
  }, []);

  const isLoading   = phase === "loading";
  const isReady     = phase === "ready";
  const isCapturing = phase === "capturing";
  const isComposing = phase === "composing";
  const isDone      = phase === "done";
  const showCam     = !isDone;

  return (
    <Page>
      <Stage>
        {/* ── Left: camera OR composed result ── */}
        <PreviewPane>
          {showCam ? (
            <CamWrap>
              <CamVideo ref={videoRef} autoPlay muted playsInline />
              <CamOverlay ref={overlayRef} />

              {/* Loading / error overlay */}
              {(isLoading || !!cameraError) && (
                <StatusOverlay $error={!!cameraError}>
                  {!cameraError && <Spinner />}
                  <div className="label">{cameraError ?? "카메라 준비 중..."}</div>
                </StatusOverlay>
              )}

              {/* Composing overlay */}
              {isComposing && (
                <StatusOverlay>
                  <Spinner />
                  <div className="label">네 컷 합성 중...</div>
                </StatusOverlay>
              )}

              {/* Capture countdown overlay */}
              {isCapturing && countdown !== null && (
                <CamCountdown>
                  <ShotBadge>{shotIndex + 1} / {SHOT_COUNT}</ShotBadge>
                  <CountNum key={`${shotIndex}-${countdown}`} $shoot={countdown === 0}>
                    {countdown === 0 ? "📸" : countdown}
                  </CountNum>
                </CamCountdown>
              )}

              {/* Flash */}
              {flash && <FlashLayer />}
            </CamWrap>
          ) : (
            <FrameWrap>
              <TapeTop src={tape} alt="" />
              <FrameInner>
                <img className="base" src={frameImg} alt="" />
                {composedSrc && <img className="composed" src={composedSrc} alt="인생네컷" />}
              </FrameInner>
              <TapeCorner $side="left" src={tape} alt="" />
              <TapeCorner $side="right" src={tape} alt="" />
            </FrameWrap>
          )}
        </PreviewPane>

        {/* ── Right: controls ── */}
        <ControlPane>
          <div>
            <Heading>{isDone ? "완성됐어요! 🎉" : "네 컷 찍기"}</Heading>
            <SubLine>VWEE · PHOTO BOOTH</SubLine>
          </div>

          {isReady && (
            <>
              <Desc>
                시작하면 {COUNTDOWN_SEC}초 카운트다운이 시작돼요.<br />
                매 컷마다 필터를 바꿀 수 있으니 준비하세요!
              </Desc>
              <FilterRow>
                {FILTERS.map(f => (
                  <Chip
                    key={f.id}
                    $active={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    disabled={!modelReady && f.id !== "none"}
                  >
                    {f.label}
                  </Chip>
                ))}
              </FilterRow>
            </>
          )}

          {isCapturing && (
            <CaptureStatus key={shotIndex}>
              <StatusLine>{shotIndex + 1} / {SHOT_COUNT}번째 촬영 중</StatusLine>
              {/* Filter picker — available during countdown so each shot can have a different look */}
              {(countdown === null || countdown > 0) && (
                <FilterRow>
                  {FILTERS.map(f => (
                    <Chip
                      key={f.id}
                      $active={filter === f.id}
                      onClick={() => setFilter(f.id)}
                      disabled={!modelReady && f.id !== "none"}
                    >
                      {f.label}
                    </Chip>
                  ))}
                </FilterRow>
              )}
              {countdown !== null && countdown > 0 && (
                <BigCount key={countdown}>{countdown}</BigCount>
              )}
              {countdown === 0 && <BigCount key="shoot">📸</BigCount>}
              {countdown === null && <StatusLine>다음 컷 준비 중...</StatusLine>}
            </CaptureStatus>
          )}

          {isComposing && (
            <StatusLine>합성 중...</StatusLine>
          )}

          {isDone && (
            <Desc>
              필터: {FILTERS.find(f => f.id === filter)?.label}<br />
              영수증 페이지에서 두 장 모두 QR로 저장할 수 있어요.
            </Desc>
          )}

          <Actions>
            {isReady && (
              <Btn className="primary" onClick={startCapture} disabled={!isReady || !!cameraError}>
                시작하기 →
              </Btn>
            )}
            {(isCapturing || isComposing) && (
              <Btn className="secondary" disabled>
                {isComposing ? "합성 중..." : `${shotIndex + 1} / ${SHOT_COUNT} 촬영 중`}
              </Btn>
            )}
            {isDone && (
              <>
                <Btn className="primary" onClick={onNext}>
                  완성! 영수증 받기 →
                </Btn>
                <Btn className="secondary" onClick={retake}>
                  다시 찍기
                </Btn>
              </>
            )}
          </Actions>
        </ControlPane>
      </Stage>
    </Page>
  );
}
