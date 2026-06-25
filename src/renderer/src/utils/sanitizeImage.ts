/**
 * 证件照净化管线 — 在渲染进程（沙箱）内执行
 * 1. base64 长度上限
 * 2. 解码前大小估算
 * 3. magic bytes 白名单（仅 JPEG / PNG）
 * 4. createImageBitmap 沙箱内解码
 * 5. 校验宽高比与分辨率
 * 6. canvas 重编码（剥 EXIF / 元数据 / 隐写夹带）
 */

// 单张图片 base64 最大字符数（约 6.7MB 编码后 ≈ 5MB 原始）
const MAX_BASE64_LENGTH = 6_800_000

// 解码后最大像素面积（4000 × 4000 = 16M）
const MAX_PIXEL_AREA = 16_000_000

// 宽高比允许偏差
const RATIO_TOLERANCE = 0.02

/**
 * 读取 Blob 前若干字节，转为十六进制字符串
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
 * 主入口：返回净化后的 base64（不含 data: 前缀）
 *
 * @param base64 - 原始 base64 字符串（来自 XML <ZhaoPian>）
 * @param expectedRatio - 预期宽高比（如 295/413）
 * @param expectedW - 标准输出宽度（px）
 * @param expectedH - 标准输出高度（px）
 */
export async function sanitizeImage(
  base64: string,
  expectedRatio: number,
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

  // 2. 解码前大小估算（base64 编码膨胀率 ≈ 4/3）
  const estimatedBytes = Math.ceil((base64.length * 3) / 4)
  if (estimatedBytes > MAX_BASE64_LENGTH) {
    throw new Error(`图片解码后过大：估算 ${estimatedBytes} 字节`)
  }

  // 构造 Data URL 以便 fetch
  // 先试探格式——用前几字节判断，如果已知则跳过；这里用通用方式：
  // 先用 fetch 加载，再校验真实格式
  let dataUrl: string
  if (base64.startsWith('data:')) {
    dataUrl = base64
  } else {
    // 尝试以 JPEG 头解码（后续 magic bytes 校验会纠正）
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

  // 4. 沙箱内解码（Chromium 内置解码器）
  const bitmap = await createImageBitmap(blob)

  // 5. 校验分辨率上限
  const area = bitmap.width * bitmap.height
  if (area > MAX_PIXEL_AREA) {
    bitmap.close()
    throw new Error(`图片分辨率过大：${bitmap.width}×${bitmap.height}`)
  }

  // 5. 校验宽高比
  const actualRatio = bitmap.width / bitmap.height
  if (Math.abs(actualRatio - expectedRatio) > RATIO_TOLERANCE) {
    bitmap.close()
    throw new Error(
      `图片宽高比不符：实际 ${actualRatio.toFixed(3)}，预期 ${expectedRatio.toFixed(3)}`
    )
  }

  // 6. canvas 重编码（归一化尺寸 + 剥元数据）
  const canvas = document.createElement('canvas')
  canvas.width = expectedW
  canvas.height = expectedH
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('无法创建 Canvas 上下文')
  }
  ctx.drawImage(bitmap, 0, 0, expectedW, expectedH)
  bitmap.close()

  // toBlob → PNG（无损，避免二次有损）
  const cleanBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) {
        resolve(b)
      } else {
        reject(new Error('Canvas toBlob 失败'))
      }
    }, 'image/png')
  })

  // 转回 base64（不含前缀）
  const cleanArrayBuffer = await cleanBlob.arrayBuffer()
  const cleanBytes = new Uint8Array(cleanArrayBuffer)
  let binaryStr = ''
  for (let i = 0; i < cleanBytes.byteLength; i++) {
    binaryStr += String.fromCharCode(cleanBytes[i])
  }
  const cleanBase64 = btoa(binaryStr)
  return cleanBase64
}
