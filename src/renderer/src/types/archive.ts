/** 家庭成员 */
export interface FamilyMember {
  ChengWei: string
  XingMing: string
  ChuShengRiQi: string
  ZhengZhiMianMao: string
  GongZuoDanWeiJiZhiWu: string
}

/** 解析后的 Person 节点内容 */
export interface ArchivePerson {
  XingMing: string
  XingBie: string
  ChuShengNianYue: string
  MinZu: string
  JiGuan: string
  ChuShengDi: string
  RuDangShiJian: string
  CanJiaGongZuoShiJian: string
  JianKangZhuangKuang: string
  ZhuanYeJiShuZhiWu: string
  ShuXiZhuanYeYouHeZhuanChang: string
  QuanRiZhiJiaoYu_XueLi: string
  QuanRiZhiJiaoYu_XueWei: string
  QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: string
  QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: string
  ZaiZhiJiaoYu_XueLi: string
  ZaiZhiJiaoYu_XueWei: string
  ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: string
  ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: string
  XianRenZhiWu: string
  NiRenZhiWu: string
  NiMianZhiWu: string
  JianLi: string
  JiangChengQingKuang: string
  NianDuKaoHeJieGuo: string
  RenMianLiYou: string
  JiaTingChengYuan: { Item: FamilyMember[] }
  ChengBaoDanWei: string
  JiSuanNianLingShiJian: string
  TianBiaoShiJian: string
  TianBiaoRen: string
  ShenFenZheng: string
  ZhaoPian: string
  Version: string
}

/** fast-xml-parser 解析产物的根结构 */
export interface ArchiveData {
  Person: ArchivePerson
}

/** 空白家庭成员模板 */
export const EMPTY_FAMILY_MEMBER: FamilyMember = {
  ChengWei: '',
  XingMing: '',
  ChuShengRiQi: '',
  ZhengZhiMianMao: '',
  GongZuoDanWeiJiZhiWu: ''
}

/** Person 节点允许出现的全部标签（严格白名单） */
export const ALLOWED_PERSON_TAGS: ReadonlySet<string> = new Set([
  'XingMing',
  'XingBie',
  'ChuShengNianYue',
  'MinZu',
  'JiGuan',
  'ChuShengDi',
  'RuDangShiJian',
  'CanJiaGongZuoShiJian',
  'JianKangZhuangKuang',
  'ZhuanYeJiShuZhiWu',
  'ShuXiZhuanYeYouHeZhuanChang',
  'QuanRiZhiJiaoYu_XueLi',
  'QuanRiZhiJiaoYu_XueWei',
  'QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi',
  'QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi',
  'ZaiZhiJiaoYu_XueLi',
  'ZaiZhiJiaoYu_XueWei',
  'ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi',
  'ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi',
  'XianRenZhiWu',
  'NiRenZhiWu',
  'NiMianZhiWu',
  'JianLi',
  'JiangChengQingKuang',
  'NianDuKaoHeJieGuo',
  'RenMianLiYou',
  'JiaTingChengYuan',
  'ChengBaoDanWei',
  'JiSuanNianLingShiJian',
  'TianBiaoShiJian',
  'TianBiaoRen',
  'ShenFenZheng',
  'ZhaoPian',
  'Version'
])

/** 家庭成员 Item 允许出现的全部标签 */
export const ALLOWED_FAMILY_TAGS: ReadonlySet<string> = new Set([
  'ChengWei',
  'XingMing',
  'ChuShengRiQi',
  'ZhengZhiMianMao',
  'GongZuoDanWeiJiZhiWu'
])

/** 校验 Person 数据—发现未知标签直接拒绝 */
export function validatePersonTags(person: Record<string, unknown>): string[] {
  const errors: string[] = []
  const keys = Object.keys(person)
  const extraKeys = keys.filter((k) => !ALLOWED_PERSON_TAGS.has(k))
  if (extraKeys.length > 0) {
    errors.push(`未知标签: ${extraKeys.join(', ')}`)
  }
  return errors
}

/** 校验单个家庭成员—发现未知标签直接拒绝 */
export function validateFamilyMemberTags(member: Record<string, unknown>, index: number): string[] {
  const errors: string[] = []
  const keys = Object.keys(member)
  const extraKeys = keys.filter((k) => !ALLOWED_FAMILY_TAGS.has(k))
  if (extraKeys.length > 0) {
    errors.push(`家庭成员[${index}] 未知标签: ${extraKeys.join(', ')}`)
  }
  return errors
}
