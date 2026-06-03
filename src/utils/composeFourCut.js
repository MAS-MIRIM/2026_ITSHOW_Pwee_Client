const FRAME_W = 720
const FRAME_H = 1280
const BG = '#FFFDF2'
const ACCENT_W = 18          // left color strip
const PADDING = 40
const GAP = 14
const FOOTER = 110
const CELL_X = PADDING + ACCENT_W
const CELL_W = FRAME_W - CELL_X - PADDING
const CELLS = 4
const CELL_H = Math.floor((FRAME_H - PADDING * 2 - GAP * (CELLS - 1) - FOOTER) / CELLS)
const CORNER = 10

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

function clipRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
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
    sh = img.height; sw = sh * tr; sx = (img.width - sw) / 2; sy = 0
  } else {
    sw = img.width; sh = sw / tr; sx = 0; sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

export async function composeFourCut(shots) {
  const canvas = document.createElement('canvas')
  canvas.width = FRAME_W
  canvas.height = FRAME_H
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, FRAME_W, FRAME_H)

  // Left accent strip
  ctx.fillStyle = '#856B6B'
  ctx.fillRect(0, 0, ACCENT_W, FRAME_H)

  const images = await Promise.all([0, 1, 2, 3].map((i) => loadImage(shots?.[i])))

  for (let i = 0; i < CELLS; i += 1) {
    const x = CELL_X
    const y = PADDING + i * (CELL_H + GAP)

    // Photo clip + draw
    ctx.save()
    clipRoundRect(ctx, x, y, CELL_W, CELL_H, CORNER)
    ctx.clip()
    drawCover(ctx, images[i], x, y, CELL_W, CELL_H)
    ctx.restore()

    // Photo border frame
    ctx.save()
    clipRoundRect(ctx, x, y, CELL_W, CELL_H, CORNER)
    ctx.strokeStyle = 'rgba(133, 107, 107, 0.35)'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.restore()
  }

  // Footer
  const footerCenterY = FRAME_H - FOOTER / 2
  ctx.fillStyle = '#856B6B'
  ctx.font = 'bold 42px "Suez One", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Pwee', FRAME_W / 2 + ACCENT_W / 2, footerCenterY - 12)

  ctx.fillStyle = '#B6A89A'
  ctx.font = '20px Georgia, serif'
  const now = new Date()
  const stamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
  ctx.fillText(stamp, FRAME_W / 2 + ACCENT_W / 2, footerCenterY + 24)

  return canvas.toDataURL('image/png')
}
