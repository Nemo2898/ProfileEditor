/**
 * 证件照净化管线 — 在渲染进程（沙箱）内执行
 * 1. 文件大小上限
 * 2. magic bytes 白名单（仅 JPEG / PNG）
 * 3. <img> 解码 + 尺寸校验
 * 4. canvas 白底 + cover-fit 缩放
 * 5. JPEG 中转去 alpha → 重画 PNG（防 Word/WPS RGBA 渲染异常）
 */

// 单张图片 base64 最大字符数（约 6.7MB 编码后 ≈ 5MB 原始）
const MAX_BASE64_LENGTH = 6_800_000

// 解码后最大像素面积（4000 × 4000 = 16M）
const MAX_PIXEL_AREA = 16_000_000

/**
 * 读取 Blob 前若干字节
 */
async function readHeaderBytes(blob: Blob, count: number): Promise<Uint8Array> {
  const slice = blob.slice(0, count)
  const buffer = await slice.arrayBuffer()
  return new Uint8Array(buffer)
}

/**
 * 校验 magic bytes — 仅白名单 JPEG / PNG
 */
function checkMagicBytes(header: Uint8Array): string | null {
  // JPEG: FF D8 FF
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return 'image/jpeg'
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47
  ) {
    return 'image/png'
  }
  return null
}

/**
 * 主入口：返回净化后 base64（不含 data: 前缀）
 * 接收 File / Blob——不经过 fetch(dataUrl)，避免 Electron sandbox 限制
 *
 * @param file - 原始图片文件
 * @param _expectedRatio - 预期宽高比（保留参数兼容）
 * @param expectedW - 标准输出宽度（px）
 * @param expectedH - 标准输出高度（px）
 */
export async function sanitizeImage(
  file: Blob,
  _expectedRatio: number,
  expectedW: number,
  expectedH: number
): Promise<string> {
  // 1. 大小上限（Blob.size 直接读）
  if (file.size > MAX_BASE64_LENGTH) {
    throw new Error(`图片过大：${file.size} 字节超过上限`)
  }
  if (file.size < 20) {
    throw new Error('图片数据过短')
  }

  // 2. magic bytes 白名单 — 拒绝 SVG 和一切非 JPEG/PNG
  const header = await readHeaderBytes(file, 16)
  const mime = checkMagicBytes(header)
  if (!mime) {
    throw new Error('不支持的图片格式：仅接受 JPEG 或 PNG')
  }

  // 3. 用 <img> 解码
  const url = URL.createObjectURL(file)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片解码失败'))
    image.src = url
  })
  URL.revokeObjectURL(url)

  const srcW = img.naturalWidth || 0
  const srcH = img.naturalHeight || 0
  if (srcW === 0 || srcH === 0) {
    throw new Error('图片尺寸异常：无法读取宽高')
  }

  // 4. 校验分辨率上限
  const area = srcW * srcH
  if (area > MAX_PIXEL_AREA) {
    throw new Error(`图片分辨率过大：${srcW}×${srcH}`)
  }

  // 5. 绘制：白底 + cover-fit 缩放（等比覆盖，居中裁剪，不拉伸变形）
  const canvas = document.createElement('canvas')
  canvas.width = expectedW
  canvas.height = expectedH
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法创建 Canvas 上下文')
  }

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, expectedW, expectedH)

  const scale = Math.max(expectedW / srcW, expectedH / srcH)
  const dw = Math.round(srcW * scale)
  const dh = Math.round(srcH * scale)
  const dx = Math.round((expectedW - dw) / 2)
  const dy = Math.round((expectedH - dh) / 2)
  ctx.drawImage(img, dx, dy, dw, dh)

  // 去 alpha 通道——先转 JPEG 再重画，最终 PNG 纯 RGB（Word/WPS 对 RGBA 渲染异常）
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95)
  const jpegImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('JPEG 回读失败'))
    image.src = jpegDataUrl
  })

  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = expectedW
  finalCanvas.height = expectedH
  const finalCtx = finalCanvas.getContext('2d')
  if (!finalCtx) {
    throw new Error('无法创建 Canvas 上下文')
  }
  finalCtx.drawImage(jpegImg, 0, 0)

  // toBlob → PNG（纯 RGB，无 alpha）
  const cleanBlob = await new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob((b) => {
      if (b) resolve(b)
      else reject(new Error('Canvas toBlob 失败'))
    }, 'image/png')
  })

  // 转回 base64（不含前缀，用 FileReader 安全转码）
  const reader = new FileReader()
  const base64DataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Base64 编码失败'))
    reader.readAsDataURL(cleanBlob)
  })
  const cleanBase64 = base64DataUrl.split(',')[1]
  return cleanBase64
}
