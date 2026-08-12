/**
 * 一次性脚本：给 templates/output.docx 补占位符
 * 1. 表格最后一行（盖章旁）"年  月  日" → 年月日三格数字占位符
 * 2. "填表人：" → "填表人：{TianBiaoRen}"
 */
const PizZip = require('pizzip')
const { readFileSync, writeFileSync } = require('fs')
const path = require('path')

const templatePath = path.resolve(__dirname, '../templates/output.docx')
const zip = new PizZip(readFileSync(templatePath))
let docXml = zip.file('word/document.xml').asText()

// 1. 只替换最后一个 "年  月  日"（表格最后一行的填表时间格，紧邻（盖章））
const idx = docXml.lastIndexOf('<w:t>年  月  日</w:t>')
if (idx === -1) throw new Error('未找到填表时间格')
docXml =
  docXml.slice(0, idx) +
  '<w:t>{TianBiaoShiJian_Y}年  {TianBiaoShiJian_M}月  {TianBiaoShiJian_D}日</w:t>' +
  docXml.slice(idx + '<w:t>年  月  日</w:t>'.length)

// 2. 填表人
const count = docXml.split('<w:t>填表人：</w:t>').length - 1
if (count === 0) throw new Error('未找到填表人')
docXml = docXml.replaceAll('<w:t>填表人：</w:t>', '<w:t>填表人：{TianBiaoRen}</w:t>')

zip.file('word/document.xml', docXml)
writeFileSync(templatePath, zip.generate({ type: 'nodebuffer' }))
console.log('模板已更新：填表时间格 +', count, '处填表人')
