export const BASE = 'http://localhost:5001'

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export function uploadPhoto(imageBase64, videoGameId) {
  return request('/api/share/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: imageBase64, video_id: videoGameId ?? null }),
  })
}

export function sendEmail(email, imageId, videoGameId) {
  return request('/api/share/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, image_id: imageId, video_id: videoGameId ?? null }),
  })
}

export function uploadVideo(gameId, videoBlob) {
  const fd = new FormData()
  fd.append('game_id', gameId)
  fd.append('file', videoBlob, `${gameId}.webm`)
  return request('/api/share/upload-video', { method: 'POST', body: fd })
}

export function fetchLeaderboard(limit = 20) {
  return request(`/api/leaderboard/solo?limit=${limit}`)
}
