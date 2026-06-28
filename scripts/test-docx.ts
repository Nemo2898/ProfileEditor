/**
 * docx 模板填充测试脚本（独立运行，不依赖 Electron）
 * 用法：npx tsx scripts/test-docx.ts
 *
 * 前提：templates/output.docx 已存在且含 {XingMing} 等占位符
 * 输出：test-output.docx（用 Word/WPS 打开验证效果）
 *
 * 数据链路：ArchivePerson → prepareDocxData(运算/拍平/过滤) → docxtemplater.render() → .docx
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import type { ArchivePerson } from '../src/renderer/src/types/archive'
import { prepareDocxData, renderDocx } from '../src/main/ipc/docx'

const templatePath = join(import.meta.dirname, '..', 'templates', 'output.docx')
const outputPath = join(import.meta.dirname, '..', 'test-output.docx')

if (!exists(templatePath)) {
  console.error(`❌ 模板不存在: ${templatePath}`)
  console.error('   请先在 Word/WPS 中打开任免表.doc，填入占位符，另存为 templates/output.docx')
  process.exit(1)
}

// ========== 压力测试数据（ArchivePerson 格式） ==========
const testPerson: ArchivePerson = {
  XingMing: '欧阳娜娜·买买提江·图尔逊别克',
  XingBie: '女',
  ChuShengNianYue: '1990.01',
  MinZu: '塔吉克族',
  JiGuan: '新疆维吾尔自治区伊犁哈萨克自治州塔城市',
  ChuShengDi: '新疆维吾尔自治区伊犁哈萨克自治州塔城市巴克图口岸',
  RuDangShiJian: '2012.06',
  CanJiaGongZuoShiJian: '2015.07',
  JianKangZhuangKuang: '良好（长期伏案工作偶有颈椎不适）',
  ZhuanYeJiShuZhiWu: '教授级高级工程师（正高级）',
  ShuXiZhuanYeYouHeZhuanChang: '计算机科学与技术、软件工程、人工智能与大数据分析',
  QuanRiZhiJiaoYu_XueLi: '博士研究生',
  QuanRiZhiJiaoYu_XueWei: '工学博士/管理学双学位',
  QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '清华大学计算机科学与技术系',
  QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '清华大学经济管理学院',
  ZaiZhiJiaoYu_XueLi: '博士后',
  ZaiZhiJiaoYu_XueWei: '',
  ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '中国科学院计算技术研究所',
  ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '',
  XianRenZhiWu: '新疆维吾尔自治区工业和信息化厅信息化推进处处长',
  NiRenZhiWu: '新疆维吾尔自治区工业和信息化厅副厅长',
  NiMianZhiWu: '新疆维吾尔自治区工业和信息化厅信息化推进处处长',
  JianLi: '2015.07—至今 新疆维吾尔自治区工业和信息化厅信息化推进处处长\n2012.07—2015.07 新疆维吾尔自治区经济和信息化委员会信息化推进处副处长\n2010.09—2012.07 新疆维吾尔自治区经济和信息化委员会信息化推进处主任科员\n2007.09—2010.07 清华大学计算机科学与技术系博士研究生\n2004.09—2007.07 清华大学计算机科学与技术系硕士研究生\n2000.09—2004.07 清华大学计算机科学与技术系本科\n1998.07—2000.09 新疆维吾尔自治区人民政府办公厅信息处科员\n1994.07—1998.06 新疆维吾尔自治区塔城地委办公室办事员',
  JiangChengQingKuang: '2020年度自治区优秀公务员\n2018年度工业和信息化部先进工作者\n2016年度自治区民族团结进步模范个人',
  NianDuKaoHeJieGuo: '2024年度 优秀\n2023年度 优秀\n2022年度 称职',
  RenMianLiYou: '因工作需要，经自治区党委组织部研究决定进行干部交流轮岗',
  JiaTingChengYuan: {
    Item: [
      { ChengWei: '妻子', XingMing: '阿依古丽·吐尔逊·买买提明', ChuShengRiQi: '1991.05', ZhengZhiMianMao: '群众', GongZuoDanWeiJiZhiWu: '新疆维吾尔自治区人民医院心内科副主任医师' },
      { ChengWei: '儿子', XingMing: '欧阳江·买买提江·图尔逊别克', ChuShengRiQi: '2018.03', ZhengZhiMianMao: '少先队员', GongZuoDanWeiJiZhiWu: '乌鲁木齐市第一小学三年级二班学生' },
      { ChengWei: '父亲', XingMing: '买买提江·图尔逊·库尔班', ChuShengRiQi: '1955.08', ZhengZhiMianMao: '中共党员（1976年入党）', GongZuoDanWeiJiZhiWu: '新疆大学历史系退休教授（博士生导师）' },
      { ChengWei: '母亲', XingMing: '帕提古丽·阿不都热依木·艾合买提', ChuShengRiQi: '1958.12', ZhengZhiMianMao: '群众', GongZuoDanWeiJiZhiWu: '乌鲁木齐市友谊医院退休护士长' },
      { ChengWei: '岳父', XingMing: '吐尔逊·司马义·阿不都拉', ChuShengRiQi: '1952.03', ZhengZhiMianMao: '中共党员（1971年入党）', GongZuoDanWeiJiZhiWu: '新疆维吾尔自治区人民政府办公厅退休巡视员' }
    ]
  },
  ChengBaoDanWei: '新疆维吾尔自治区工业和信息化厅人事处',
  JiSuanNianLingShiJian: '2026.06',
  TianBiaoShiJian: '2026.06.20',
  TianBiaoRen: '艾尼瓦尔·买买提·阿不都热西提',
  ShenFenZheng: '659001199001010123',
  ZhaoPian: '',
  Version: '3.2.1.16'
}

// ========== 核心管线 ==========
try {
  // 1. 转换：LRMX 数据 → DOCX 渲染数据（运算年龄、拍平家庭、过滤多余字段）
  const renderData = prepareDocxData(testPerson)
  console.log('👤 本人年龄:', renderData.NianLing)
  console.log('👪 家庭成员:', renderData.Item.map(item => `${item.ChengWei}(${item.NianLing}岁)`).join(', '))

  // 2. 渲染 + 写出
  renderDocx(renderData, templatePath, outputPath)
  console.log(`\n✅ 测试成功: ${outputPath}`)
  console.log('   用 Word/WPS 打开验证版式效果')
} catch (err) {
  console.error('❌ 填充失败:', String(err))
  console.error('   可能原因：模板中的占位符格式不正确或字段名不匹配')
  process.exit(1)
}

function exists(p: string): boolean {
  try {
    readFileSync(p)
    return true
  } catch {
    return false
  }
}
