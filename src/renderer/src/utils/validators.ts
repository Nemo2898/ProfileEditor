/**
 * 表单校验工具 — 纯函数，返回错误信息数组（空 = 通过）
 *
 * 校验层次：
 * - 身份证号格式与校验位
 * - 日期格式
 * - 证件照基本检测
 * - 家庭成员部分填写
 */

import type { FamilyMember } from '../types/archive'

/** 字段中文名映射（用于 UI 标签） */
export const FIELD_LABELS: Record<string, string> = {
  XingMing: '姓名',
  XingBie: '性别',
  ChuShengNianYue: '出生年月',
  MinZu: '民族',
  JiGuan: '籍贯',
  ChuShengDi: '出生地',
  RuDangShiJian: '入党时间',
  CanJiaGongZuoShiJian: '参加工作时间',
  JianKangZhuangKuang: '健康状况',
  ZhuanYeJiShuZhiWu: '专业技术职务',
  ShuXiZhuanYeYouHeZhuanChang: '熟悉专业有何专长',
  QuanRiZhiJiaoYu_XueLi: '全日制教育—学历',
  QuanRiZhiJiaoYu_XueWei: '全日制教育—学位',
  QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '全日制教育—毕业院校系',
  QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '全日制教育—学位毕业院校系',
  ZaiZhiJiaoYu_XueLi: '在职教育—学历',
  ZaiZhiJiaoYu_XueWei: '在职教育—学位',
  ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '在职教育—毕业院校系',
  ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '在职教育—学位毕业院校系',
  XianRenZhiWu: '现任职务',
  NiRenZhiWu: '拟任职务',
  NiMianZhiWu: '拟免职务',
  JianLi: '简历',
  JiangChengQingKuang: '奖惩情况',
  NianDuKaoHeJieGuo: '年度考核结果',
  RenMianLiYou: '任免理由',
  ChengBaoDanWei: '呈报单位',
  JiSuanNianLingShiJian: '计算年龄时间',
  TianBiaoShiJian: '填表时间',
  TianBiaoRen: '填表人',
  ShenFenZheng: '身份证号'
}

/** 身份证加权因子（前 17 位） */
const ID_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]

/** 校验码映射 */
const ID_CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

/**
 * 身份证号格式与校验位验证
 * 返回 null = 通过，否则返回错误信息
 */
export function validateIdNumber(id: string): string | null {
  const trimmed = id.trim()
  if (trimmed.length === 0) {
    return null // 允许不填
  }
  if (trimmed.length !== 18) {
    return '身份证号必须为 18 位'
  }
  // 前 17 位必须全数字
  for (let i = 0; i < 17; i++) {
    if (trimmed.charCodeAt(i) < 48 || trimmed.charCodeAt(i) > 57) {
      return '身份证号前 17 位必须为数字'
    }
  }
  // 校验位计算
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += (trimmed.charCodeAt(i) - 48) * ID_WEIGHTS[i]
  }
  const expected = ID_CHECK_CODES[sum % 11]
  const actual = trimmed.charAt(17).toUpperCase()
  if (actual !== expected) {
    return '身份证号校验位不正确'
  }
  return null
}

/**
 * 简便日期格式校验（YYYY-MM 或 YYYY.MM 或 YYYY 或 YYYY-MM-DD 或 YYYY.MM.DD）
 */
export function validateDate(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return null
  }
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  if (/^\d{4}-\d{2}$/.test(trimmed)) return null
  if (/^\d{4}$/.test(trimmed)) return null
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(trimmed)) return null
  if (/^\d{4}\.\d{2}$/.test(trimmed)) return null
  return `日期格式不正确：${value}`
}

/**
 * 出生日期 YYYY.MM.DD 严格校验（用于 ChuShengNianYue / ChuShengRiQi）
 * 不允许空、不允许短格式
 */
export function validateBirthDate(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return '年龄格式错误 请按照年份.月份.日期'
  }
  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(value.trim())) {
    return '年龄格式错误 请按照年份.月份.日期'
  }
  return null
}

/**
 * 证件照基本检测（有值时校验长度，允许留空）
 */
export function validatePhoto(base64: string): string | null {
  const trimmed = base64.trim()
  if (trimmed.length === 0) {
    return null // 允许不填
  }
  if (trimmed.length < 20) {
    return '证件照数据异常（过短）'
  }
  return null
}

/**
 * 家庭成员部分填写检测
 * 规则：某一行只要填了任意字段，则称谓和姓名必须都填
 */
export function validateFamilyMember(member: FamilyMember, index: number): string[] {
  const errors: string[] = []
  // 检查是否有任意字段非空
  const hasContent =
    member.ChengWei.trim() ||
    member.XingMing.trim() ||
    member.ChuShengRiQi.trim() ||
    member.ZhengZhiMianMao.trim() ||
    member.GongZuoDanWeiJiZhiWu.trim()
  if (!hasContent) {
    return errors // 空行跳过
  }
  // 如果填写了，称谓和姓名必填
  if (!member.ChengWei.trim()) {
    errors.push(`家庭成员 ${index + 1}：称谓为必填项`)
  }
  if (!member.XingMing.trim()) {
    errors.push(`家庭成员 ${index + 1}：姓名为必填项`)
  }
  // 出生日期格式验证（YYYY.MM.DD）
  const birthErr = validateBirthDate(member.ChuShengRiQi.trim())
  if (birthErr) {
    errors.push(`家庭成员 ${index + 1}：${birthErr}`)
  }
  return errors
}
