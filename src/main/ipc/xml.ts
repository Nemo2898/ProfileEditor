/**
 * .lrmx XML 文件读写 — 防 XXE、原子写、白名单校验
 * .lrmx 本质即 XML，内部结构与副本.xml 一致（<Person> 根 + 34 标签）
 */

import {
  readFileSync,
  writeFileSync,
  renameSync,
  unlinkSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync
} from 'fs'
import { join, dirname } from 'path'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { validatePersonTags, validateFamilyMemberTags } from '../../renderer/src/types/archive'

/** XML 解析器 — 标准实体反转义（&amp;→&），不处理 HTML 实体 */
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: true,
  htmlEntities: false,
  // 不处理 DTD
  allowBooleanAttributes: false
})

/** XML 构建器 — 输出 <> </> 风格 */
const builder = new XMLBuilder({
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false
})

/**
 * 拒绝含 DOCTYPE / ENTITY 的 XML 字符串（XXE 总闸）
 */
function rejectDoctype(xmlString: string): void {
  if (xmlString.includes('<!DOCTYPE') || xmlString.includes('<!ENTITY')) {
    throw new Error('XML 包含禁止的 DOCTYPE / ENTITY')
  }
}

/** 文件大小上限（50MB） */
const MAX_FILE_SIZE = 50 * 1024 * 1024

/**
 * 打开 .lrmx → 解析 → 标签白名单校验 → 返回 Person 数据
 */
export function openLrmx(filePath: string): object {
  const raw = readFileSync(filePath, 'utf-8')

  // 文件大小上限
  if (raw.length > MAX_FILE_SIZE) {
    throw new Error(`文件过大：${raw.length} 字节，上限 ${MAX_FILE_SIZE}`)
  }

  // XXE 总闸
  rejectDoctype(raw)

  // 解析
  const doc = parser.parse(raw)

  // 必须有 Person 根节点
  if (!doc.Person) {
    throw new Error('XML 缺少根节点 <Person>')
  }

  const person = doc.Person as Record<string, unknown>

  // 标签白名单校验
  const tagErrors = validatePersonTags(person)
  if (tagErrors.length > 0) {
    throw new Error(tagErrors.join('; '))
  }

  // 家庭成员标签白名单
  const jtcy = person.JiaTingChengYuan as { Item?: Record<string, unknown>[] } | undefined
  if (jtcy && jtcy.Item && Array.isArray(jtcy.Item)) {
    jtcy.Item.forEach((item, i) => {
      const errs = validateFamilyMemberTags(item, i)
      if (errs.length > 0) throw new Error(errs.join('; '))
    })
  }

  return person
}

/**
 * 保存数据 → 序列化 XML → 原子写入 .lrmx
 */
export function saveLrmx(data: Record<string, unknown>, filePath: string): void {
  // 序列化：XML 声明手拼（builder 不支持 '?xml' 键，输出畸形 <?xml?>）
  const xmlString =
    '<?xml version="1.0" encoding="utf-8"?>\n' + builder.build({ Person: data }) + '\n'

  // 原子写：先写临时文件再 rename（防写一半崩溃损坏档案）
  const tmpPath = join(dirname(filePath), `.${Date.now()}.tmp`)
  try {
    writeFileSync(tmpPath, xmlString, 'utf-8')
    renameSync(tmpPath, filePath)
  } catch (err) {
    // 清理临时文件
    if (existsSync(tmpPath)) {
      try {
        unlinkSync(tmpPath)
      } catch {
        /* ignore */
      }
    }
    throw err
  }
}

/**
 * 返回 runtime_docs 目录路径，不存在则创建
 */
export function getRuntimeDir(app: Electron.App): string {
  const dir = join(app.getPath('userData'), 'runtime_docs')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

/**
 * 新建空白临时档案 → 写 runtime_docs/temp_<ts>.lrmx → 返回路径
 */
export function newBlankDoc(runtimeDir: string): string {
  const ts = Date.now()
  const tempPath = join(runtimeDir, `temp_${ts}.lrmx`)

  // 计算年龄时间/填表时间默认当天（联网时间不可控时退至本机时间）
  const now = new Date()
  const jiSuanShiJian = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`
  const tianBiaoShiJian = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`

  // 从空白模板填充（如果模板不存在就用空数据）
  const person = {
    XingMing: '',
    XingBie: '',
    ChuShengNianYue: '',
    MinZu: '',
    JiGuan: '',
    ChuShengDi: '',
    RuDangShiJian: '',
    CanJiaGongZuoShiJian: '',
    JianKangZhuangKuang: '',
    ZhuanYeJiShuZhiWu: '',
    ShuXiZhuanYeYouHeZhuanChang: '',
    QuanRiZhiJiaoYu_XueLi: '',
    QuanRiZhiJiaoYu_XueWei: '',
    QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '',
    QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '',
    ZaiZhiJiaoYu_XueLi: '',
    ZaiZhiJiaoYu_XueWei: '',
    ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '',
    ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '',
    XianRenZhiWu: '',
    NiRenZhiWu: '',
    NiMianZhiWu: '',
    JianLi: '',
    JiangChengQingKuang: '',
    NianDuKaoHeJieGuo: '',
    RenMianLiYou: '',
    JiaTingChengYuan: {
      Item: Array.from({ length: 10 }, () => ({
        ChengWei: '',
        XingMing: '',
        ChuShengRiQi: '',
        ZhengZhiMianMao: '',
        GongZuoDanWeiJiZhiWu: ''
      }))
    },
    ChengBaoDanWei: '',
    JiSuanNianLingShiJian: jiSuanShiJian,
    TianBiaoShiJian: tianBiaoShiJian,
    TianBiaoRen: '',
    ShenFenZheng: '',
    ZhaoPian: '',
    Version: '3.2.1.16'
  }

  saveLrmx(person, tempPath)
  return tempPath
}

/**
 * 清空 runtime_docs 目录下所有临时文件
 */
export function clearRuntimeDocs(runtimeDir: string): void {
  if (!existsSync(runtimeDir)) return
  const files = readdirSync(runtimeDir)
  for (const file of files) {
    try {
      rmSync(join(runtimeDir, file), { force: true })
    } catch {
      /* ignore */
    }
  }
}
