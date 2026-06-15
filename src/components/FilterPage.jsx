import { useCallback, useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { useGameSession } from "../context/gameSession";
import { getFaceLandmarker, LANDMARK } from "../utils/faceLandmarker";
import { uploadVideo } from "../api/shareApi";
import bunnyUrl from "../assets/filters/bunny-ears.svg";
import glassesUrl from "../assets/filters/glasses.svg";
import heartUrl from "../assets/filters/heart.svg";

const COUNTDOWN_SEC = 15;
const RING_R = 28;
const RING_C = 2 * Math.PI * RING_R;
const REC_SEC = 5;

const FILTERS = [
  { id: "none", label: "없음", emoji: "✕" },
  { id: "bunny", label: "토끼", emoji: "🐰" },
  { id: "glasses", label: "안경", emoji: "👓" },
  { id: "heart", label: "하트", emoji: "💗" },
];

const pop = keyframes`
  0% { transform: scale(0.9); opacity: 0.4; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Page = styled.div`
  position: fixed;
  inset: 0;
  background: #fffdf2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 2.4vw, 28px);
  box-sizing: border-box;
  overflow: hidden;
`;

const Stage = styled.div`
  width: min(820px, 100%);
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: clamp(10px, 1.2vw, 16px);
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  padding: 0 2px;
`;

const TopMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
`;

const Title = styled.h1`
  font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  font-size: clamp(24px, 2.8vw, 32px);
  line-height: 1.05;
  color: #463c3c;
  margin: 0;
`;

const Status = styled.div`
  font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  font-size: clamp(12px, 1.3vw, 14px);
  font-weight: 700;
  color: #856b6b;
  word-break: keep-all;
`;

const RingWrap = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Ring = styled.svg`
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

const RingCount = styled.span`
  position: relative;
  font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  font-size: 22px;
  color: ${({ $warn }) => ($warn ? "#C44545" : "#463C3C")};
  font-variant-numeric: tabular-nums;
  z-index: 1;
`;

const CamWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  max-height: min(60vh, 540px);
  border-radius: 24px;
  background: #111;
  padding: 0;
  box-sizing: border-box;
  box-shadow: 0 12px 28px rgba(31, 26, 26, 0.14);
`;

const CamInner = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 24px;
  overflow: hidden;
  background: #000;
`;

const Video = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
`;

const Overlay = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  pointer-events: none;
`;

const StatusOverlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: ${({ $error }) =>
    $error ? "rgba(80, 20, 20, 0.9)" : "rgba(31, 26, 26, 0.72)"};
  color: #fffdf2;
  font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  text-align: center;
  padding: 18px;
  z-index: 3;

  .spin {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid rgba(255, 253, 242, 0.25);
    border-top-color: #f8e9c8;
    animation: ${spin} 0.9s linear infinite;
  }
  .label {
    font-family:
      "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
    font-size: clamp(13px, 1.5vw, 16px);
    letter-spacing: 0.1em;
  }
  .detail {
    font-size: 12px;
    color: #dcc9a8;
    max-width: 360px;
    word-break: keep-all;
  }
`;

const RetryBtn = styled.button`
  font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  font-size: 14px;
  color: #463c3c;
  background: #f8e9c8;
  border: none;
  border-radius: 999px;
  padding: 8px 18px;
  cursor: pointer;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: nowrap;
  padding: 6px;
  border-radius: 14px;
  background: #f5efe7;
`;

const Chip = styled.button`
  font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  flex: 1;
  min-width: 0;
  font-size: clamp(13px, 1.25vw, 14px);
  font-weight: 800;
  border-radius: 10px;
  min-height: 42px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background: ${({ $active }) => ($active ? "#463C3C" : "transparent")};
  color: ${({ $active }) => ($active ? "#FFFDF2" : "#463C3C")};
  cursor: pointer;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.96);
  }
  ${({ $active }) =>
    $active &&
    css`
      animation: ${pop} 0.25s ease-out;
    `}

  .emoji {
    display: none;
  }
`;

const CaptureActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Shutter = styled.button`
  font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  font-size: clamp(16px, 1.7vw, 18px);
  font-weight: 800;
  color: #fffdf2;
  background: #463c3c;
  border: none;
  border-radius: 12px;
  min-height: 54px;
  padding: 0 22px;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    opacity 0.12s ease;

  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const RecordBtn = styled.button`
  font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  font-size: clamp(14px, 1.5vw, 16px);
  font-weight: 800;
  color: ${({ $recording }) => ($recording ? "#FFFDF2" : "#463C3C")};
  background: ${({ $recording }) => ($recording ? "#856B6B" : "#fff")};
  border: 1px solid rgba(133, 107, 107, 0.22);
  border-radius: 12px;
  min-height: 54px;
  padding: 0 18px;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    background 0.2s,
    opacity 0.12s ease;

  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const VideoStatus = styled.p`
  text-align: center;
  font-family: "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: ${({ $status }) =>
    $status === "done"
      ? "#2e7d32"
      : $status === "error"
        ? "#c44545"
        : "#856b6b"};
  margin: 0;
`;

function loadSticker(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function drawStickers(ctx, landmarks, filter, stickers, w, h) {
  if (!landmarks || filter === "none") return;
  const nose = landmarks[LANDMARK.noseTip];
  const leftEye = landmarks[LANDMARK.leftEyeOuter];
  const rightEye = landmarks[LANDMARK.rightEyeOuter];
  const forehead = landmarks[LANDMARK.foreheadTop];
  if (!nose || !leftEye || !rightEye || !forehead) return;

  const eyeDx = (rightEye.x - leftEye.x) * w;
  const eyeDy = (rightEye.y - leftEye.y) * h;
  const eyeWidth = Math.hypot(eyeDx, eyeDy);
  const angle = Math.atan2(eyeDy, eyeDx);

  if (filter === "bunny" && stickers.bunny) {
    const earsW = eyeWidth * 2;
    const earsH =
      earsW * (stickers.bunny.naturalHeight / stickers.bunny.naturalWidth);
    const fx = forehead.x * w;
    const fy = forehead.y * h - earsH * 1.1;
    ctx.save();
    ctx.translate(fx, fy + earsH / 2);
    ctx.rotate(angle);
    ctx.drawImage(stickers.bunny, -earsW / 2, -earsH / 2, earsW, earsH);
    ctx.restore();
  }

  if (filter === "glasses" && stickers.glasses) {
    const gW = eyeWidth * 2;
    const gH = gW * (200 / 380);
    const cx = ((leftEye.x + rightEye.x) / 2) * w;
    const cy = ((leftEye.y + rightEye.y) / 2) * h + eyeWidth * 0.04;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.drawImage(stickers.glasses, -gW / 2, -gH / 2, gW, gH);
    ctx.restore();
  }

  if (filter === "heart" && stickers.heart) {
    const hSize = eyeWidth * 0.72;
    const leftCheek = {
      x: leftEye.x * w - eyeWidth * 0.18,
      y: leftEye.y * h + eyeWidth * 0.62,
    };
    const rightCheek = {
      x: rightEye.x * w + eyeWidth * 0.18,
      y: rightEye.y * h + eyeWidth * 0.62,
    };
    ctx.save();
    ctx.translate(leftCheek.x, leftCheek.y);
    ctx.rotate(angle - 0.18);
    ctx.drawImage(stickers.heart, -hSize / 2, -hSize / 2, hSize, hSize);
    ctx.restore();
    ctx.save();
    ctx.translate(rightCheek.x, rightCheek.y);
    ctx.rotate(angle + 0.18);
    ctx.drawImage(stickers.heart, -hSize / 2, -hSize / 2, hSize, hSize);
    ctx.restore();
  }
}

function FilterPageInner({ onRetry, onDone }) {
  const { setFilterShot, setVideoGameId } = useGameSession();
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const rafRef = useRef(0);
  const landmarkerRef = useRef(null);
  const stickersRef = useRef({});
  const lastLandmarksRef = useRef([]);
  const filterRef = useRef("bunny");
  const shotTakenRef = useRef(false);

  const [filter, setFilter] = useState("bunny");
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false); // true on success OR fallback
  const [statusLabel, setStatusLabel] = useState("카메라 준비 중");
  const [statusDetail, setStatusDetail] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const [modelError, setModelError] = useState(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);
  const [recording, setRecording] = useState(false);
  const [recCountdown, setRecCountdown] = useState(0);
  const [videoStatus, setVideoStatus] = useState(null); // null | 'uploading' | 'done' | 'error'
  const recorderRef = useRef(null);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  // Phase A: camera. StrictMode dev runs this twice; the first run's cancelled flag
  // stops its stream on cleanup, the second run actually attaches.
  useEffect(() => {
    let stream = null;
    let cancelled = false;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("이 브라우저는 카메라를 지원하지 않아요");
        }
        console.info("[filter] camera: requesting permission");
        setStatusLabel("카메라 권한 요청");
        setStatusDetail("");
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        console.info("[filter] camera: stream acquired");

        const video = videoRef.current;
        if (!video) {
          console.warn("[filter] camera: video ref missing, aborting");
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        // Some browsers won't auto-start playback even with autoPlay+muted when srcObject
        // is set after mount — call play() explicitly and swallow any benign rejection.
        try {
          await video.play();
          console.info("[filter] camera: video.play() resolved");
        } catch (playErr) {
          console.warn(
            "[filter] camera: video.play() rejected (continuing):",
            playErr,
          );
        }
        if (cancelled) return;
        // Reveal the camera. Overlay dims are synced inside the rAF loop once
        // videoWidth becomes non-zero — no need to block on loadedmetadata.
        setCameraReady(true);
        setStatusLabel("준비 완료");
        setStatusDetail("");
        console.info(
          "[filter] camera: ui unblocked, readyState=",
          video.readyState,
          "paused=",
          video.paused,
        );
      } catch (err) {
        console.error("[filter] camera failed:", err);
        const msg =
          err?.name === "NotAllowedError"
            ? "카메라 권한이 거부되었습니다"
            : err?.name === "NotReadableError"
              ? "카메라가 다른 곳에서 사용 중입니다"
              : (err?.message ?? "카메라를 사용할 수 없어요");
        setCameraError(msg);
      }
    }
    startCamera();

    const videoElAtSetup = videoRef.current;
    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (videoElAtSetup) videoElAtSetup.srcObject = null;
    };
  }, []);

  // Phase B: MediaPipe + stickers (runs in parallel with camera).
  // Landmarker is a singleton, so double-invocation in StrictMode is harmless.
  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        console.info(
          "[filter] model: loading stickers + landmarker in parallel",
        );
        const [landmarker, bunny, glasses, heart] = await Promise.all([
          getFaceLandmarker().catch((e) => {
            console.warn("[filter] model: landmarker rejected:", e);
            return null;
          }),
          loadSticker(bunnyUrl),
          loadSticker(glassesUrl),
          loadSticker(heartUrl),
        ]);
        if (cancelled) return;

        landmarkerRef.current = landmarker;
        stickersRef.current = { bunny, glasses, heart };

        if (!landmarker) {
          setModelError("AR 모델을 못 불러왔어요 (스티커 없이 진행)");
        }
        setModelReady(true);
        console.info("[filter] model: ready", {
          landmarker: !!landmarker,
          stickers: { bunny: !!bunny, glasses: !!glasses, heart: !!heart },
        });
      } catch (err) {
        console.error("[filter] model load failed:", err);
        setModelError(err?.message ?? "AR 모델 로드 실패");
        setModelReady(true); // allow shutter even if model fails
      }
    }
    loadModel();

    return () => {
      cancelled = true;
    };
  }, []);

  // Phase C: render loop — starts when camera is up. Landmarker is optional.
  useEffect(() => {
    if (!cameraReady) return undefined;
    let cancelled = false;

    const v = videoRef.current;
    const overlay = overlayRef.current;
    if (!v || !overlay) return undefined;

    const ctx = overlay.getContext("2d");
    console.info("[filter] loop: starting");
    setStatusLabel("3/3 준비 완료");
    setStatusDetail("");

    const loop = () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth) {
        if (overlay.width !== video.videoWidth)
          overlay.width = video.videoWidth;
        if (overlay.height !== video.videoHeight)
          overlay.height = video.videoHeight;
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        const lm = landmarkerRef.current;
        if (lm) {
          try {
            const result = lm.detectForVideo(video, performance.now());
            lastLandmarksRef.current = result?.faceLandmarks ?? [];
          } catch {
            /* keep last landmarks */
          }
          for (const landmarks of lastLandmarksRef.current) {
            drawStickers(
              ctx,
              landmarks,
              filterRef.current,
              stickersRef.current,
              overlay.width,
              overlay.height,
            );
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [cameraReady]);

  const takeShot = useCallback(() => {
    if (shotTakenRef.current) return;
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || video.videoWidth === 0) return;
    shotTakenRef.current = true;

    const w = video.videoWidth;
    const h = video.videoHeight;
    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const ctx = out.getContext("2d");
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    if (overlay) ctx.drawImage(overlay, 0, 0, w, h);
    ctx.restore();

    const dataUrl = out.toDataURL("image/png");
    setFilterShot(dataUrl);
    onDone();
  }, [onDone, setFilterShot]);

  const startRecording = useCallback(() => {
    if (recording) return;
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || video.videoWidth === 0) return;

    const out = document.createElement("canvas");
    out.width = video.videoWidth;
    out.height = video.videoHeight;
    const octx = out.getContext("2d");

    let animId;
    const drawFrame = () => {
      if (video.readyState >= 2 && video.videoWidth) {
        if (out.width !== video.videoWidth) out.width = video.videoWidth;
        if (out.height !== video.videoHeight) out.height = video.videoHeight;
        octx.save();
        octx.translate(out.width, 0);
        octx.scale(-1, 1);
        octx.drawImage(video, 0, 0);
        if (overlay) octx.drawImage(overlay, 0, 0);
        octx.restore();
      }
      animId = requestAnimationFrame(drawFrame);
    };
    animId = requestAnimationFrame(drawFrame);

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const canvasStream = out.captureStream(25);
    const recorder = new MediaRecorder(canvasStream, { mimeType });
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      cancelAnimationFrame(animId);
      const blob = new Blob(chunks, { type: mimeType });

      const gameId = `filter-${Date.now()}`;
      setVideoStatus("uploading");
      uploadVideo(gameId, blob)
        .then(() => {
          setVideoStatus("done");
          setVideoGameId(gameId);
        })
        .catch(() => setVideoStatus("error"));
    };

    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
    setRecCountdown(REC_SEC);

    const id = setInterval(() => {
      setRecCountdown((s) => {
        if (s <= 1) {
          clearInterval(id);
          recorder.stop();
          setRecording(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [recording, setVideoGameId]);

  // Countdown starts once camera is up so users aren't auto-shuttered into a blank shot.
  useEffect(() => {
    if (!cameraReady) return undefined;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          takeShot();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cameraReady, takeShot]);

  const progress = countdown / COUNTDOWN_SEC;
  const fatal = !!cameraError; // model error is non-fatal
  const showOverlay = !cameraReady || fatal;

  return (
    <Page>
      <Stage>
        <TopBar>
          <TopMeta>
            <Title>AR 필터 촬영</Title>
            <Status>
              {cameraError
                ? `에러: ${cameraError}`
                : modelError && cameraReady
                  ? modelError
                  : statusLabel}
            </Status>
          </TopMeta>
          <RingWrap>
            <Ring viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r={RING_R}
                stroke="#F0E2C4"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r={RING_R}
                stroke={countdown <= 5 ? "#C44545" : "#463C3C"}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - progress)}
                style={{
                  transition: "stroke-dashoffset 0.9s linear, stroke 0.2s",
                }}
              />
            </Ring>
            <RingCount $warn={countdown <= 5}>{countdown}</RingCount>
          </RingWrap>
        </TopBar>

        <CamWrap>
          <CamInner>
            <Video ref={videoRef} autoPlay muted playsInline />
            <Overlay ref={overlayRef} />
          </CamInner>
          {showOverlay && (
            <StatusOverlay $error={fatal}>
              {!fatal && <div className="spin" />}
              <div className="label">
                {fatal ? `에러: ${cameraError}` : statusLabel}
              </div>
              {statusDetail && !fatal && (
                <div className="detail">{statusDetail}</div>
              )}
              {fatal && (
                <RetryBtn type="button" onClick={onRetry}>
                  다시 시도
                </RetryBtn>
              )}
            </StatusOverlay>
          )}
        </CamWrap>

        <FilterRow>
          {FILTERS.map((f) => (
            <Chip
              key={f.id}
              type="button"
              $active={filter === f.id}
              onClick={() => setFilter(f.id)}
              disabled={!modelReady && f.id !== "none"}
            >
              <span className="emoji">{f.emoji}</span>
              {f.label}
            </Chip>
          ))}
        </FilterRow>

        <CaptureActions>
          <Shutter type="button" onClick={takeShot} disabled={!cameraReady}>
            지금 찍기
          </Shutter>
          <RecordBtn
            type="button"
            $recording={recording}
            onClick={startRecording}
            disabled={!cameraReady || recording}
          >
            {recording ? `녹화 중 ${recCountdown}s` : "동영상 녹화 5초"}
          </RecordBtn>
        </CaptureActions>
        {videoStatus && (
          <VideoStatus $status={videoStatus}>
            {videoStatus === "uploading" && "영상 서버 저장 중..."}
            {videoStatus === "done" && "영상 서버 저장 완료!"}
            {videoStatus === "error" && "영상 서버 저장 실패"}
          </VideoStatus>
        )}
      </Stage>
    </Page>
  );
}

export default function FilterPage({ onDone }) {
  const [retryKey, setRetryKey] = useState(0);
  return (
    <FilterPageInner
      key={retryKey}
      onRetry={() => setRetryKey((k) => k + 1)}
      onDone={onDone}
    />
  );
}
