/**
 * 证件照净化管线 — 在渲染进程（沙箱）内执行
 * 1. base64 长度上限
 * 2. 解码前大小估算
 * 3. magic bytes 白名单（仅 JPEG / PNG）
 * 4. createImageBitmap 沙箱内解码
 * 5. 校验分辨率上限
 * 6. 等比居中裁剪至目标尺寸（强制 4:5）+ 剥 EXIF / 元数据 / 隐写夹带
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
 * 计算等比居中裁剪的源区域
 * 目标 800×1000（4:5），不拉伸变形，多余部分从两侧/上下裁掉
 */
function calcCover(sourceW: number, sourceH: number, targetW: number, targetH: number) {
  const targetRatio = targetW / targetH
  const sourceRatio = sourceW / sourceH

  let sx = 0
  let sy = 0
  let sw = sourceW
  let sh = sourceH

  if (sourceRatio > targetRatio) {
    // 源图偏宽 → 裁左右
    sw = sourceH * targetRatio
    sx = (sourceW - sw) / 2
  } else {
    // 源图偏高 → 裁上下
    sh = sourceW / targetRatio
    sy = (sourceH - sh) / 2
  }

  return { sx, sy, sw, sh }
}

/**
 * 主入口：返回净化后 base64（不含 data: 前缀）
 * 宽高比不符时自动居中裁剪至目标尺寸，不做拒绝
 *
 * @param base64 - 原始 base64 字符串
 * @param _expectedRatio - 预期宽高比（保留参数兼容，不再拒绝不符图片）
 * @param expectedW - 标准输出宽度（px）
 * @param expectedH - 标准输出高度（px）
 */
export async function sanitizeImage(
  base64: string,
  _expectedRatio: number,
  expectedW: number,
  expectedH: number
): Promise<string> {
  // 1. base64 长度上限
  if (base64.length > MAX_BASE64_LENGTH) {
    throw new Error(`图片过大：base64 长度 ${base64.length} 超过上限 ${MAX_BASE64_LENGTH}`)
  }
  if (base64.length < 100) {
    throw new Error('图片数据过短')
  }

  // 2. 解码前大小估算
  const estimatedBytes = Math.ceil((base64.length * 3) / 4)
  if (estimatedBytes > MAX_BASE64_LENGTH) {
    throw new Error(`图片解码后过大：估算 ${estimatedBytes} 字节`)
  }

  let dataUrl: string
  if (base64.startsWith('data:')) {
    dataUrl = base64
  } else {
    dataUrl = `data:image/jpeg;base64,${base64}`
  }

  const response = await fetch(dataUrl)
  if (!response.ok) {
    throw new Error('无法加载图片数据')
  }
  const blob = await response.blob()

  // 3. magic bytes 白名单 — 拒绝 SVG 和一切非 JPEG/PNG
  const header = await readHeaderBytes(blob, 16)
  const mime = checkMagicBytes(header)
  if (!mime) {
    throw new Error('不支持的图片格式：仅接受 JPEG 或 PNG')
  }

  // 4. 沙箱内解码
  const bitmap = await createImageBitmap(blob)

  // 5. 校验分辨率上限
  const area = bitmap.width * bitmap.height
  if (area > MAX_PIXEL_AREA) {
    bitmap.close()
    throw new Error(`图片分辨率过大：${bitmap.width}×${bitmap.height}`)
  }

  // 6. 居中裁剪 + 重编码（剥元数据）
  const canvas = document.createElement('canvas')
  canvas.width = expectedW
  canvas.height = expectedH
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('无法创建 Canvas 上下文')
  }

  // 自动居中裁剪，强制填充目标尺寸
  const { sx, sy, sw, sh } = calcCover(bitmap.width, bitmap.height, expectedW, expectedH)
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, expectedW, expectedH)
  bitmap.close()

  // toBlob → PNG
  const cleanBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) {
        resolve(b)
      } else {
        reject(new Error('Canvas toBlob 失败'))
      }
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
