/**
 * docx 模板填充测试脚本（独立运行，不依赖 Electron）
 * 用法：npx tsx scripts/test-docx.ts
 *
 * 前提：templates/output.docx 已存在且含 {XingMing} 等占位符
 * 输出：test-output.docx（用 Word/WPS 打开验证效果）
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

const templatePath = join(import.meta.dirname, '..', 'templates', 'output.docx')
const outputPath = join(import.meta.dirname, '..', 'test-output.docx')

if (!exists(templatePath)) {
  console.error(`❌ 模板不存在: ${templatePath}`)
  console.error('   请先在 Word/WPS 中打开任免表.doc，填入占位符，另存为 templates/output.docx')
  process.exit(1)
}

// 构造测试数据（模拟 store 中的 ArchivePerson）
const testData = {
  XingMing: '张三',
  XingBie: '男',
  ChuShengNianYue: '1990.01',
  MinZu: '汉族',
  JiGuan: '北京市',
  ChuShengDi: '北京市海淀区',
  RuDangShiJian: '2012.06',
  CanJiaGongZuoShiJian: '2015.07',
  JianKangZhuangKuang: '良好',
  ZhuanYeJiShuZhiWu: '高级工程师',
  ShuXiZhuanYeYouHeZhuanChang: '计算机科学与技术',
  QuanRiZhiJiaoYu_XueLi: '研究生',
  QuanRiZhiJiaoYu_XueWei: '工学硕士',
  QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '清华大学',
  QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '清华大学',
  ZaiZhiJiaoYu_XueLi: '',
  ZaiZhiJiaoYu_XueWei: '',
  ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '',
  ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '',
  XianRenZhiWu: '处长',
  NiRenZhiWu: '副局长',
  NiMianZhiWu: '处长',
  JianLi: '2015.07—至今 某单位处长\n2012.07—2015.07 某单位科员',
  JiangChengQingKuang: '2020年度优秀公务员',
  NianDuKaoHeJieGuo: '2024年度 称职',
  RenMianLiYou: '工作需要',
  JiaTingChengYuan: {
    Item: [
      {
        ChengWei: '妻子',
        XingMing: '李四',
        ChuShengRiQi: '1991.05',
        ZhengZhiMianMao: '群众',
        GongZuoDanWeiJiZhiWu: '某公司职员'
      }
    ]
  },
  ChengBaoDanWei: '某厅人事处',
  JiSuanNianLingShiJian: '2026.06',
  TianBiaoShiJian: '2026.06.20',
  TianBiaoRen: '王五',
  ShenFenZheng: '110108199001011234',
  ZhaoPian: '',
  Version: '3.2.1.16'
}

try {
  const template = readFileSync(templatePath)
  const zip = new PizZip(template)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true
  })

  // 教育栏合并策略：拼接学位信息
  // 由于 DOC 模板的学历/学位在一个合并格里，毕业院校系也在一格里
  // 这里拼接供模板使用（如果模板按文档建议用了合并格式）
  doc.render(testData)

  const buf = doc.getZip().generate({ type: 'nodebuffer' })
  writeFileSync(outputPath, buf)
  console.log(`✅ 测试成功: ${outputPath}`)
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

import.meta.dirname
