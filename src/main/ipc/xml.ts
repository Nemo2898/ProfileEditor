/**
 * .lrmx XML 文件读写 — 防 XXE、原子写、白名单校验
 * .lrmx 本质即 XML，内部结构与副本.xml 一致（<Person> 根 + 34 标签）
 */

import { readFileSync, writeFileSync, renameSync, unlinkSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { ALLOWED_PERSON_TAGS, ALLOWED_FAMILY_TAGS, validatePersonTags, validateFamilyMemberTags } from '../../renderer/src/types/archive'

/** XML 解析器 — 关闭实体处理 */
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: false,
  externalEntities: false,
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
  // 序列化
  const xmlDoc = { '?xml': { '@_version': '1.0', '@_encoding': 'utf-8' }, Person: data }
  const xmlString = builder.build(xmlDoc) + '\n'

  // 原子写：先写临时文件再 rename（防写一半崩溃损坏档案）
  const tmpPath = join(dirname(filePath), `.${Date.now()}.tmp`)
  try {
    writeFileSync(tmpPath, xmlString, 'utf-8')
    renameSync(tmpPath, filePath)
  } catch (err) {
    // 清理临时文件
    if (existsSync(tmpPath)) {
      try { unlinkSync(tmpPath) } catch { /* ignore */ }
    }
    throw err
  }
}
