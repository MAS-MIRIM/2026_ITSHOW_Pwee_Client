import { pageOrder } from '../data/gameContent'

export function getPageFromHash() {
  const hash = window.location.hash.replace('#', '')
  return pageOrder.includes(hash) ? hash : 'entry'
}
