import { io } from 'socket.io-client'
import { BASE } from './shareApi'

async function req(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data
}

export function getOrCreateUser(userName) {
  return req('/api/solo/user', { user_name: userName })
}

export function createSocket() {
  return io(BASE, { transports: ['websocket'], autoConnect: false })
}
