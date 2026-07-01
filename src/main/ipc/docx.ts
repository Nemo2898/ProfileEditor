/**
 * DOCX 导出 — docxtemplater 模板填充
 *
 * 数据链路：LRMX ArchivePerson → prepareDocxData(运算年龄/拍平家庭/跳过证件号) → doc.render() → .docx
 */

import { readFileSync, writeFileSync } from 'fs'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import ImageModule from 'docxtemplater-image-module-free'
import sharp from 'sharp'
import type { ArchivePerson } from '../../renderer/src/types/archive'

/** DOCX 渲染用的扁平家庭成员（年龄已计算） */
export interface DocxFamilyMember {
  ChengWei: string
  XingMing: string
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
  const [by, bm] = String(birth).split('.').map(s => parseInt(s, 10))
  const [ry, rm] = String(refDate).split('.').map(s => parseInt(s, 10))
  let age = ry - by
  if (rm < bm) age--
  return age
}

/** 家庭成员表固定 10 行——不足的补空 */
const FAMILY_ROW_COUNT = 10

const EMPTY_DOCX_FAMILY: DocxFamilyMember = {
  ChengWei: '',
  XingMing: '',
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
    NianLing: refDate ? calcAge(member.ChuShengRiQi, refDate) : '',
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
    ChuShengNianYue: person.ChuShengNianYue,
    NianLing: refDate ? calcAge(person.ChuShengNianYue, refDate) : '',
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
 * @param data 经 prepareDocxData 转换后的数据
 * @param templatePath 模板 .docx 路径
 * @param outputPath 输出 .docx 路径
 */
export async function renderDocx(data: DocxRenderData, templatePath: string, outputPath: string): Promise<void> {
  // 去 alpha 通道
  if (data.ZhaoPian && data.ZhaoPian.length > 100) {
    const b64 = data.ZhaoPian.replace(/^data:image\/\w+;base64,/, '')
    const buf = Buffer.from(b64, 'base64')
    const stripped = await sharp(buf).removeAlpha().png().toBuffer()
    data.ZhaoPian = 'data:image/png;base64,' + stripped.toString('base64')
  }

  const template = readFileSync(templatePath)
  const zip = new PizZip(template)

  // 图片模块：证件照注入
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
      return [200, 250]
    }
  })

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [imageModule]
  })

  doc.render(data)

  const buf = doc.getZip().generate({ type: 'nodebuffer' })

  // 后处理：替换 ImageModule drawing 为 docx 包验证过的精确模板
  const PizZip2 = require('pizzip')
  const debugZip = new PizZip2(buf)
  
  // 记下 rId（ImageModule 生成的 relationship ID）
  const postDoc = debugZip.file('word/document.xml')!.asText()
  const rIdMatch = postDoc.match(/r:embed="(rId\d+)"/)
  const rId = rIdMatch ? rIdMatch[1] : 'rId5'
  
  // 从 docx 包验证过的模板构造 drawing XML（仅换 EMU 和 rId）
  const PHOTO_EMU_W = 1905000
  const PHOTO_EMU_H = 2381250
  const newDrawing = `<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${PHOTO_EMU_W}" cy="${PHOTO_EMU_H}"/><wp:effectExtent t="0" r="0" b="0" l="0"/><wp:docPr id="1" name="" descr="" title=""/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="" descr=""/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}" cstate="none"/><a:srcRect/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="${PHOTO_EMU_W}" cy="${PHOTO_EMU_H}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>`
  
  const fixed = postDoc.replace(/<w:drawing>.*?<\/w:drawing>/s, newDrawing)
  debugZip.file('word/document.xml', fixed)
  const finalBuf = debugZip.generate({ type: 'nodebuffer' })
  writeFileSync(outputPath, finalBuf)
}
