/**
 * DOCX 导出 — docxtemplater 模板填充
 *
 * 数据链路：LRMX ArchivePerson → prepareDocxData(运算年龄/拍平家庭/跳过证件号) → doc.render() → .docx
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import ImageModule from 'docxtemplater-image-module-free'
import type { ArchivePerson } from '../../renderer/src/types/archive'

/** DOCX 渲染用的扁平家庭成员（年龄已计算） */
export interface DocxFamilyMember {
  ChengWei: string
  XingMing: string
  ChuShengRiQi: string
  NianLing: number | string
  ZhengZhiMianMao: string
  GongZuoDanWeiJiZhiWu: string
}

/** 最终的 DOCX 渲染数据 */
export interface DocxRenderData {
  XingMing: string
  XingBie: string
  ChuShengNianYue: string
  NianLing: number | string
  MinZu: string
  JiGuan: string
  ChuShengDi: string
  RuDangShiJian: string
  CanJiaGongZuoShiJian: string
  JianKangZhuangKuang: string
  ZhuanYeJiShuZhiWu: string
  ShuXiZhuanYeYouHeZhuanChang: string
  QuanRiZhiJiaoYu_XueLi: string
  QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: string
  ZaiZhiJiaoYu_XueLi: string
  ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: string
  XianRenZhiWu: string
  NiRenZhiWu: string
  NiMianZhiWu: string
  JianLi: string
  JiangChengQingKuang: string
  NianDuKaoHeJieGuo: string
  RenMianLiYou: string
  Item: DocxFamilyMember[]
  ChengBaoDanWei: string
  TianBiaoShiJian: string
  TianBiaoRen: string
  ZhaoPian: string
}

/**
 * 从出生日期和计算年龄参考时间推算周岁
 * @param birth e.g. "1990.01" | "1991.05"
 * @param refDate e.g. "2026.06"
 */
export function calcAge(birth: string, refDate: string): number {
  if (!birth || !refDate) return 0
  const [by, bm] = String(birth).split('.').map(s => parseInt(s, 10))
  const [ry, rm] = String(refDate).split('.').map(s => parseInt(s, 10))
  if (isNaN(by) || isNaN(bm) || isNaN(ry) || isNaN(rm)) return 0
  let age = ry - by
  if (rm < bm) age--
  return age
}

/** 家庭成员表固定 10 行——不足的补空 */
const FAMILY_ROW_COUNT = 10

const EMPTY_DOCX_FAMILY: DocxFamilyMember = {
  ChengWei: '',
  XingMing: '',
  ChuShengRiQi: '',
  NianLing: '',
  ZhengZhiMianMao: '',
  GongZuoDanWeiJiZhiWu: ''
}

/**
 * 将 LRMX ArchivePerson 转换为 docxtemplater 渲染数据
 *
 * 做了三件事：
 * 1. 年龄运算：本人从 ChuShengNianYue + JiSuanNianLingShiJian 算，家属从 ChuShengRiQi 算
 * 2. 拍平家庭数组：JiaTingChengYuan.Item → 根层 Item，丢弃 ChuShengRiQi（DOCX 只显年龄）
 * 3. 跳过 ShenFenZheng、JiSuanNianLingShiJian、Version（纸质表格无这些栏）
 */
export function prepareDocxData(person: ArchivePerson): DocxRenderData {
  const refDate = String(person.JiSuanNianLingShiJian || '')
  const rawItems = (person.JiaTingChengYuan?.Item ?? []).map(member => ({
    ChengWei: member.ChengWei,
    XingMing: member.XingMing,
    ChuShengRiQi: member.ChuShengRiQi?.replace(/\./g, '') ?? '',
    NianLing: (refDate && member.ChuShengRiQi?.trim()) ? calcAge(member.ChuShengRiQi, refDate) : '',
    ZhengZhiMianMao: member.ZhengZhiMianMao,
    GongZuoDanWeiJiZhiWu: member.GongZuoDanWeiJiZhiWu
  }))

  // 补足到最少 10 行，多的保留
  const paddedItems = rawItems.length >= FAMILY_ROW_COUNT
    ? rawItems
    : [...rawItems, ...Array.from({ length: FAMILY_ROW_COUNT - rawItems.length }, () => ({ ...EMPTY_DOCX_FAMILY }))]

  return {
    XingMing: person.XingMing,
    XingBie: person.XingBie,
    ChuShengNianYue: person.ChuShengNianYue?.replace(/\./g, '') ?? '',
    NianLing: (refDate && person.ChuShengNianYue?.trim()) ? calcAge(person.ChuShengNianYue, refDate) : '',
    MinZu: person.MinZu,
    JiGuan: person.JiGuan,
    ChuShengDi: person.ChuShengDi,
    RuDangShiJian: person.RuDangShiJian,
    CanJiaGongZuoShiJian: person.CanJiaGongZuoShiJian,
    JianKangZhuangKuang: person.JianKangZhuangKuang,
    ZhuanYeJiShuZhiWu: person.ZhuanYeJiShuZhiWu,
    ShuXiZhuanYeYouHeZhuanChang: person.ShuXiZhuanYeYouHeZhuanChang,
    // 教育栏学位合并：学历/学位用 \n 分隔——docxtemplater 的 linebreaks:true 将 \n 转为 <w:br/>
    QuanRiZhiJiaoYu_XueLi: [person.QuanRiZhiJiaoYu_XueLi, person.QuanRiZhiJiaoYu_XueWei].filter(Boolean).join('\n'),
    QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: [person.QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi, person.QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi].filter(Boolean).join('\n'),
    ZaiZhiJiaoYu_XueLi: [person.ZaiZhiJiaoYu_XueLi, person.ZaiZhiJiaoYu_XueWei].filter(Boolean).join('\n'),
    ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: [person.ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi, person.ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi].filter(Boolean).join('\n'),
    XianRenZhiWu: person.XianRenZhiWu,
    NiRenZhiWu: person.NiRenZhiWu,
    NiMianZhiWu: person.NiMianZhiWu,
    JianLi: person.JianLi,
    JiangChengQingKuang: person.JiangChengQingKuang,
    NianDuKaoHeJieGuo: person.NianDuKaoHeJieGuo,
    RenMianLiYou: person.RenMianLiYou,
    Item: paddedItems,
    ChengBaoDanWei: person.ChengBaoDanWei,
    TianBiaoShiJian: person.TianBiaoShiJian,
    TianBiaoRen: person.TianBiaoRen,
    ZhaoPian: person.ZhaoPian
  }
}

/**
 * 将渲染数据填入模板 → 写出 .docx
 */
export function renderDocx(data: DocxRenderData, templatePath: string, outputPath: string): void {
  const template = readFileSync(templatePath)
  const zip = new PizZip(template)

  const imageModule = new ImageModule({
    centered: false,
    fileType: 'docx',
    getImage(tagValue: string): Buffer {
      if (!tagValue) {
        return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
      }
      const b64 = tagValue.replace(/^data:image\/\w+;base64,/, '')
      return Buffer.from(b64, 'base64')
    },
    getSize(): [number, number] {
      return [137, 171]
    }
  })

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [imageModule]
  })

  doc.render(data)

  const buf = doc.getZip().generate({ type: 'nodebuffer' })

  // 后处理：去 a:noFill
  const postZip = new PizZip(buf)
  const postDoc = postZip.file('word/document.xml')!.asText()
  const fixed = postDoc
    .replace(/<a:ln><a:noFill\/><\/a:ln>/g, '')
    .replace(/<a:noFill\/>/g, '')
    .replace(/<a:ln><\/a:ln>/g, '')
  postZip.file('word/document.xml', fixed)
  const finalBuf = postZip.generate({ type: 'nodebuffer' })
  writeFileSync(outputPath, finalBuf)
}

/**
 * 将 ArchivePerson 生成 PDF（通过隐藏 BrowserWindow + printToPDF）
 */
export async function generatePdf(person: ArchivePerson): Promise<Buffer> {
  const { BrowserWindow } = require('electron')
  const data = prepareDocxData(person)
  const familyRows = data.Item.slice(0, FAMILY_ROW_COUNT)

  const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const photoHtml = data.ZhaoPian && data.ZhaoPian.length > 100
    ? `<img src="${esc(data.ZhaoPian)}" style="width:100%;height:100%;object-fit:cover"/>`
    : '照片'

  const familyHtml = familyRows.map((m, i) =>
    `<tr>
      <td class="td">${esc(m.ChengWei)}</td>
      <td class="td">${esc(m.XingMing)}</td>
      <td class="td"><span style="font-size:9px">${esc(m.ChuShengRiQi)}</span><br/>${m.NianLing}</td>
      <td class="td">${esc(m.ZhengZhiMianMao)}</td>
      <td class="td">${esc(m.GongZuoDanWeiJiZhiWu)}</td>
    </tr>`
  ).join('')

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"SimSun","宋体",serif;font-size:12px;color:#000;padding:20px}
  .page{max-width:210mm;margin:0 auto}
  table{border-collapse:collapse;width:100%;table-layout:fixed}
  .td{border:1px solid #000;padding:2px 4px;font-size:11px;vertical-align:top;word-break:break-all}
  .th{border:1px solid #000;padding:2px 4px;font-size:11px;text-align:center;background:#f5f5f5}
  .title{text-align:center;font-size:16px;font-weight:bold;margin-bottom:8px}
  @media print{@page{size:A4;margin:10mm}}
</style></head><body>
<div class="page">
  <div class="title">干 部 任 免 审 批 表</div>
  <table>
    <colgroup><col width="9%"><col width="19%"><col width="9%"><col width="19%"><col width="9%"><col width="19%"><col width="16%"></colgroup>
    <tr>
      <td class="th">姓 名</td><td class="td">${esc(data.XingMing)}</td>
      <td class="th">性 别</td><td class="td">${esc(data.XingBie)}</td>
      <td class="th">出生年月</td>
      <td class="td"><span style="font-size:9px">${esc(data.ChuShengNianYue)}</span><br/>${data.NianLing}</td>
      <td class="td" rowspan="5" style="text-align:center;vertical-align:middle">${photoHtml}</td>
    </tr>
    <tr>
      <td class="th">民 族</td><td class="td">${esc(data.MinZu)}</td>
      <td class="th">籍 贯</td><td class="td">${esc(data.JiGuan)}</td>
      <td class="th">出生地</td><td class="td">${esc(data.ChuShengDi)}</td>
    </tr>
    <tr>
      <td class="th">入党时间</td><td class="td">${esc(data.RuDangShiJian)}</td>
      <td class="th">参加工作时间</td><td class="td">${esc(data.CanJiaGongZuoShiJian)}</td>
      <td class="th">健康状况</td><td class="td">${esc(data.JianKangZhuangKuang)}</td>
    </tr>
    <tr>
      <td class="th">专业技术职务</td><td class="td" colspan="3">${esc(data.ZhuanYeJiShuZhiWu)}</td>
      <td class="th">熟悉专业有何专长</td><td class="td">${esc(data.ShuXiZhuanYeYouHeZhuanChang)}</td>
    </tr>
    <tr>
      <td class="th"></td><td class="th">学历</td><td class="th">学位</td><td class="th" colspan="3">毕业院校系及专业</td>
    </tr>
    <tr>
      <td class="th">全日制教育</td><td class="td">${esc(data.QuanRiZhiJiaoYu_XueLi.split('\n')[0])}</td><td class="td">${esc(data.QuanRiZhiJiaoYu_XueLi.split('\n')[1] || '')}</td>
      <td class="td" colspan="3">${esc(data.QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi)}</td>
    </tr>
    <tr>
      <td class="th">在职教育</td><td class="td">${esc(data.ZaiZhiJiaoYu_XueLi.split('\n')[0])}</td><td class="td">${esc(data.ZaiZhiJiaoYu_XueLi.split('\n')[1] || '')}</td>
      <td class="td" colspan="3">${esc(data.ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi)}</td>
    </tr>
    <tr>
      <td class="th">现 任 职 务</td><td class="td">${esc(data.XianRenZhiWu)}</td>
      <td class="th">拟 任 职 务</td><td class="td">${esc(data.NiRenZhiWu)}</td>
      <td class="th">拟 免 职 务</td><td class="td">${esc(data.NiMianZhiWu)}</td>
    </tr>
    <tr>
      <td class="th">简 历</td><td class="td" colspan="6">${esc(data.JianLi).replace(/\n/g, '<br/>')}</td>
    </tr>
    <tr>
      <td class="th">奖 惩 情 况</td><td class="td" colspan="6">${esc(data.JiangChengQingKuang).replace(/\n/g, '<br/>')}</td>
    </tr>
    <tr>
      <td class="th">年度考核结果</td><td class="td" colspan="6">${esc(data.NianDuKaoHeJieGuo).replace(/\n/g, '<br/>')}</td>
    </tr>
    <tr>
      <td class="th">任 免 理 由</td><td class="td" colspan="6">${esc(data.RenMianLiYou).replace(/\n/g, '<br/>')}</td>
    </tr>
  </table>

  <div style="margin-top:12px;font-weight:bold">家庭成员及重要社会关系</div>
  <table>
    <colgroup><col width="12%"><col width="12%"><col width="18%"><col width="16%"><col width="42%"></colgroup>
    <tr>
      <td class="th">称 谓</td><td class="th">姓 名</td>
      <td class="th">出生日期/年龄</td><td class="th">政治面貌</td>
      <td class="th">工作单位及职务</td>
    </tr>
    ${familyHtml}
  </table>

  <table style="margin-top:12px">
    <colgroup><col width="12%"><col width="38%"><col width="12%"><col width="38%"></colgroup>
    <tr>
      <td class="th">身份证号</td><td class="td"></td>
      <td class="th">呈报单位</td><td class="td">${esc(data.ChengBaoDanWei)}</td>
    </tr>
    <tr>
      <td class="th">计算年龄时间</td><td class="td">${esc(person.JiSuanNianLingShiJian)}</td>
      <td class="th">填表时间</td><td class="td">${esc(data.TianBiaoShiJian)}</td>
    </tr>
    <tr>
      <td class="th">填表人</td><td class="td" colspan="3">${esc(data.TianBiaoRen)}</td>
    </tr>
  </table>
</div></body></html>`

  const tmpDir = mkdtempSync(join(tmpdir(), 'pdf-'))
  const htmlPath = join(tmpDir, 'form.html')
  writeFileSync(htmlPath, html, 'utf-8')

  const win = new BrowserWindow({
    width: 800,
    height: 1000,
    show: false,
    webPreferences: { sandbox: true, nodeIntegration: false }
  })

  try {
    await win.loadFile(htmlPath)
    // 等图片加载完
    await new Promise(resolve => setTimeout(resolve, 500))
    const pdfBuf = await win.webContents.printToPDF({
      printBackground: true,
      landscape: false,
      pageSize: 'A4'
    })
    return pdfBuf
  } finally {
    win.close()
    try { rmSync(tmpDir, { recursive: true }) } catch { /* ignore */ }
  }
}
