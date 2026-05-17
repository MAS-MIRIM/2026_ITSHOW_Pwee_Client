import { useEffect, useRef } from 'react'

export function useWebcamCapture(videoRef, { enabled = true, intervalMs = 3000, onCapture, mirror = true } = {}) {
  const canvasRef = useRef(null)
  const onCaptureRef = useRef(onCapture)

  useEffect(() => {
    onCaptureRef.current = onCapture
  }, [onCapture])

  useEffect(() => {
    if (!enabled) return undefined

    const id = setInterval(() => {
      const video = videoRef?.current
      if (!video || video.readyState < 2 || video.videoWidth === 0) return

      let canvas = canvasRef.current
      if (!canvas) {
        canvas = document.createElement('canvas')
        canvasRef.current = canvas
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (mirror) {
        ctx.save()
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
      onCaptureRef.current?.(dataUrl)
    }, intervalMs)

    return () => clearInterval(id)
  }, [videoRef, enabled, intervalMs, mirror])
}
