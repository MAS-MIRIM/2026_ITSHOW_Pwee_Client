const FRAME_W = 720
const FRAME_H = 1280
const PADDING = 40
const GAP = 24
const CELL_W = FRAME_W - PADDING * 2
const CELLS = 4
const CELL_H = Math.floor(
  (FRAME_H - PADDING * 2 - GAP * (CELLS - 1) - 140) / CELLS,
)

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function drawCover(ctx, img, x, y, w, h) {
  if (!img) {
    ctx.fillStyle = '#EFE7DA'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = '#B6A89A'
    ctx.font = '20px "Suez One", Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('NO SHOT', x + w / 2, y + h / 2)
    return
  }
  const ir = img.width / img.height
  const tr = w / h
  let sw, sh, sx, sy
  if (ir > tr) {
    sh = img.height
    sw = sh * tr
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = sw / tr
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

export async function composeFourCut(shots) {
  const canvas = document.createElement('canvas')
  canvas.width = FRAME_W
  canvas.height = FRAME_H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#1F1A1A'
  ctx.fillRect(0, 0, FRAME_W, FRAME_H)

  const images = await Promise.all([0, 1, 2, 3].map((i) => loadImage(shots?.[i])))

  for (let i = 0; i < CELLS; i += 1) {
    const x = PADDING
    const y = PADDING + i * (CELL_H + GAP)
    drawCover(ctx, images[i], x, y, CELL_W, CELL_H)
  }

  const footerY = FRAME_H - 100
  ctx.fillStyle = '#F8E9C8'
  ctx.font = 'bold 44px "Suez One", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Pwee', FRAME_W / 2, footerY)

  ctx.fillStyle = '#B6A89A'
  ctx.font = '22px Georgia, serif'
  const now = new Date()
  const stamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
  ctx.fillText(stamp, FRAME_W / 2, footerY + 40)

  return canvas.toDataURL('image/png')
}
