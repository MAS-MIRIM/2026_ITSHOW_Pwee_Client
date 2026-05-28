const BASE = 'http://localhost:5001'

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export function startSoloGame(userName) {
  return request('/api/solo/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_name: userName }),
  })
}

export function sendFrame(gameId, imageBase64) {
  return request('/api/solo/frame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_id: gameId, image_base64: imageBase64 }),
  })
}

export function finishSoloGame(gameId, userName) {
  return request('/api/solo/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_id: gameId, user_name: userName }),
  })
}