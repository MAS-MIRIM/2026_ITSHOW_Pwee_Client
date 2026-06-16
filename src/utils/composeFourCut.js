import frameSrc from '../assets/frame.png'

const SOURCE_FRAME_W = 1906
const SOURCE_FRAME_H = 5473
const OUTPUT_W = 720
const SCALE = OUTPUT_W / SOURCE_FRAME_W
const FRAME_W = OUTPUT_W
const FRAME_H = Math.round(SOURCE_FRAME_H * SCALE)
const FOOTER_Y0 = 4518
const FRAME_HOLES = [
  [114, 159, 1757, 1232],
  [114, 1299, 1757, 2327],
  [114, 2394, 1757, 3422],
  [114, 3489, 1757, 4517],
]

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
    ctx.font = '20px Georgia, serif'
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
  const frame = await loadImage(frameSrc)
  const canvas = document.createElement('canvas')
  canvas.width = FRAME_W
  canvas.height = FRAME_H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#FFD27F'
  ctx.fillRect(0, 0, FRAME_W, FRAME_H)

  const images = await Promise.all([0, 1, 2, 3].map((i) => loadImage(shots?.[i])))

  FRAME_HOLES.forEach(([x0, y0, x1, y1], i) => {
    drawCover(
      ctx,
      images[i],
      Math.round(x0 * SCALE),
      Math.round(y0 * SCALE),
      Math.round((x1 - x0) * SCALE),
      Math.round((y1 - y0) * SCALE),
    )
  })

  if (frame) {
    ctx.drawImage(
      frame,
      0,
      0,
      SOURCE_FRAME_W,
      SOURCE_FRAME_H,
      0,
      0,
      FRAME_W,
      FRAME_H,
    )
  }

  const now = new Date()
  const stamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
  const brandY = Math.round((FOOTER_Y0 + 390) * SCALE)

  ctx.fillStyle = '#503214'
  ctx.font = 'bold 76px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('VWEE', FRAME_W / 2, brandY)

  ctx.font = '31px Georgia, serif'
  ctx.fillText(stamp, FRAME_W / 2, brandY + 72)

  return canvas.toDataURL('image/jpeg', 0.95)
}
