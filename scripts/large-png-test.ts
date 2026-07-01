/**
 * 独立测试：用已知有效的 PNG base64 走完整 ImageModule 管线
 * 对比 Electron app 和纯 Node.js 行为
 */
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import ImageModule from 'docxtemplater-image-module-free'

const templatePath = join(import.meta.dirname, '..', 'templates', 'output.docx')
const outputPath = '/tmp/large-png-test-output.docx'

// 16×16 蓝色实心 PNG base64
const TEST_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAFklEQVR4nGOQs9lCEmIY1TCqYfhqAAD1NA4QRFEAdAAAAABJRU5ErkJggg=='

const testData = {
  XingMing: '测试', XingBie: '男', ChuShengNianYue: '1990.01.15',
  NianLing: 36, MinZu: '汉', JiGuan: '北京', ChuShengDi: '北京',
  RuDangShiJian: '', CanJiaGongZuoShiJian: '', JianKangZhuangKuang: '',
  ZhuanYeJiShuZhiWu: '', ShuXiZhuanYeYouHeZhuanChang: '',
  QuanRiZhiJiaoYu_XueLi: '', QuanRiZhiJiaoYu_XueWei: '',
  QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '', QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '',
  ZaiZhiJiaoYu_XueLi: '', ZaiZhiJiaoYu_XueWei: '',
  ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '', ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '',
  XianRenZhiWu: '', NiRenZhiWu: '', NiMianZhiWu: '',
  JianLi: '', JiangChengQingKuang: '', NianDuKaoHeJieGuo: '', RenMianLiYou: '',
  Item: [],
  ChengBaoDanWei: '', TianBiaoShiJian: '', TianBiaoRen: '',
  ZhaoPian: `data:image/png;base64,${TEST_PNG_B64}`
}

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
    const buf = Buffer.from(b64, 'base64')
    console.log('[NODE-TEST] Buffer size:', buf.length, 'first 8 hex:', buf.slice(0, 8).toString('hex'))
    return buf
  },
  getSize(): [number, number] {
    return [512, 512]
  }
})

const doc = new Docxtemplater(zip, {
  paragraphLoop: true,
  linebreaks: true,
  modules: [imageModule]
})

doc.render(testData)
const out = doc.getZip().generate({ type: 'nodebuffer' })
writeFileSync(outputPath, out)
console.log('Written:', outputPath)
