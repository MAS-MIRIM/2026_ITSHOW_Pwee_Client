import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// Major.minor wildcard so jsdelivr resolves to the latest patch in the installed line.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task'

let landmarkerPromise = null

async function tryCreate(fileset, delegate) {
  return FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: 'VIDEO',
    numFaces: 4,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  })
}

export function getFaceLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      console.info('[faceLandmarker] resolving wasm fileset')
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL)
      console.info('[faceLandmarker] fileset resolved, creating landmarker (GPU)')
      try {
        const lm = await tryCreate(fileset, 'GPU')
        console.info('[faceLandmarker] ready (GPU)')
        return lm
      } catch (gpuErr) {
        console.warn('[faceLandmarker] GPU delegate failed, retrying CPU:', gpuErr)
        const lm = await tryCreate(fileset, 'CPU')
        console.info('[faceLandmarker] ready (CPU)')
        return lm
      }
    })().catch((err) => {
      console.error('[faceLandmarker] failed to load:', err)
      landmarkerPromise = null
      throw new Error(`MediaPipe 로드 실패: ${err?.message ?? err}`)
    })
  }
  return landmarkerPromise
}

// MediaPipe landmark index references:
//   nose tip: 1, left eye outer: 33, right eye outer: 263,
//   forehead top (approx): 10, chin: 152
export const LANDMARK = {
  noseTip: 1,
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftEyeInner: 133,
  rightEyeInner: 362,
  foreheadTop: 10,
  chin: 152,
  mouthLeft: 61,
  mouthRight: 291,
}
