/**
 * 第 1 页 — 干部任免审批表（基本信息 / 教育 / 职务 / 简历 / 奖惩 / 考核 / 任免理由）
 */

import { useRef, useCallback } from 'react'
import { useArchiveStore } from '../store/archive'
import { TextInput, TextArea, TD, TH } from './FormFields'
import { sanitizeImage } from '../utils/sanitizeImage'
import { flashError } from '../utils/flash'

export default function Page1(): React.JSX.Element {
  const data = useArchiveStore((s) => {
    const doc = s.activeId ? s.docs[s.activeId] : undefined
    return doc?.data
  })
  const setField = useArchiveStore((s) => s.setField)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      flashError('请选择图片文件（JPEG / PNG）')
      return
    }

    try {
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsDataURL(file)
      })

      const cleanBase64 = await sanitizeImage(dataUrl, 0.8, 800, 1000)
      setField('ZhaoPian', `data:image/png;base64,${cleanBase64}`)
    } catch (err) {
      flashError('证件照处理失败：' + String(err))
    } finally {
      // 重置 input 以允许重复选同一文件
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [setField])

  if (!data) return <div className="p-4 text-slate-400 text-sm">未打开档案</div>

  const hasPhoto = data.ZhaoPian && data.ZhaoPian.length > 100

  return (
    <div className="p-4 max-w-[210mm] mx-auto bg-stone-50">
      <table className="border-collapse w-full border border-gray-400">
        <colgroup>
          <col className="w-[9%]" />
          <col className="w-[19%]" />
          <col className="w-[9%]" />
          <col className="w-[19%]" />
          <col className="w-[9%]" />
          <col className="w-[19%]" />
          <col className="w-[16%]" />
        </colgroup>

        <tbody>
          {/* ===== 行1: 姓名 / 性别 / 出生年月 / 照片 ===== */}
          <tr>
            <td className={TH}>姓名</td>
            <td className={TD}>
              <TextInput value={data.XingMing} onChange={(v) => setField('XingMing', v)} />
            </td>
            <td className={TH}>性别</td>
            <td className={TD}>
              <TextInput value={data.XingBie} onChange={(v) => setField('XingBie', v)} />
            </td>
            <td className={TH}>出生年月(岁)</td>
            <td className={TD}>
              <TextInput
                value={data.ChuShengNianYue}
                onChange={(v) => setField('ChuShengNianYue', v)}
              />
            </td>
            <td className="border border-gray-400 text-center align-middle" rowSpan={5} style={{ width: '16%' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full min-h-[160px] flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {hasPhoto ? (
                  <img src={data.ZhaoPian} alt="证件照" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">
                    点此上传<br />证件照
                  </span>
                )}
              </button>
            </td>
          </tr>

          {/* ===== 行2: 民族 / 籍贯 / 出生地 ===== */}
          <tr>
            <td className={TH}>民族</td>
            <td className={TD}>
              <TextInput value={data.MinZu} onChange={(v) => setField('MinZu', v)} />
            </td>
            <td className={TH}>籍贯</td>
            <td className={TD}>
              <TextInput value={data.JiGuan} onChange={(v) => setField('JiGuan', v)} />
            </td>
            <td className={TH}>出生地</td>
            <td className={TD}>
              <TextInput value={data.ChuShengDi} onChange={(v) => setField('ChuShengDi', v)} />
            </td>
          </tr>

          {/* ===== 行3: 入党时间 / 参加工作时间 / 健康状况 ===== */}
          <tr>
            <td className={TH}>入党时间</td>
            <td className={TD}>
              <TextInput
                value={data.RuDangShiJian}
                onChange={(v) => setField('RuDangShiJian', v)}
              />
            </td>
            <td className={TH}>参加工作时间</td>
            <td className={TD}>
              <TextInput
                value={data.CanJiaGongZuoShiJian}
                onChange={(v) => setField('CanJiaGongZuoShiJian', v)}
              />
            </td>
            <td className={TH}>健康状况</td>
            <td className={TD}>
              <TextInput
                value={data.JianKangZhuangKuang}
                onChange={(v) => setField('JianKangZhuangKuang', v)}
              />
            </td>
          </tr>

          {/* ===== 行4: 专业技术职务 / 熟悉专业有何专长 ===== */}
          <tr>
            <td className={TH}>专业技术职务</td>
            <td className={TD} colSpan={3}>
              <TextInput
                value={data.ZhuanYeJiShuZhiWu}
                onChange={(v) => setField('ZhuanYeJiShuZhiWu', v)}
              />
            </td>
            <td className={TH}>熟悉专业有何专长</td>
            <td className={TD}>
              <TextInput
                value={data.ShuXiZhuanYeYouHeZhuanChang}
                onChange={(v) => setField('ShuXiZhuanYeYouHeZhuanChang', v)}
              />
            </td>
          </tr>

          {/* ===== 行5: 学历/学位 ===== */}
          <tr>
            <td className={TH} colSpan={1}></td>
            <td className={TH}>学历</td>
            <td className={TH}>学位</td>
            <td className={TH} colSpan={3}>
              毕业院校系及专业
            </td>
          </tr>

          {/* ===== 全日制教育 ===== */}
          <tr>
            <td className={TH}>全日制教育</td>
            <td className={TD}>
              <TextInput
                value={data.QuanRiZhiJiaoYu_XueLi}
                onChange={(v) => setField('QuanRiZhiJiaoYu_XueLi', v)}
              />
            </td>
            <td className={TD}>
              <TextInput
                value={data.QuanRiZhiJiaoYu_XueWei}
                onChange={(v) => setField('QuanRiZhiJiaoYu_XueWei', v)}
              />
            </td>
            <td className={TD} colSpan={3}>
              <div className="grid grid-cols-2 gap-1">
                <TextInput
                  value={data.QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi}
                  onChange={(v) => setField('QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi', v)}
                />
                <TextInput
                  value={data.QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi}
                  onChange={(v) => setField('QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi', v)}
                />
              </div>
            </td>
          </tr>

          {/* ===== 在职教育 ===== */}
          <tr>
            <td className={TH}>在职教育</td>
            <td className={TD}>
              <TextInput
                value={data.ZaiZhiJiaoYu_XueLi}
                onChange={(v) => setField('ZaiZhiJiaoYu_XueLi', v)}
              />
            </td>
            <td className={TD}>
              <TextInput
                value={data.ZaiZhiJiaoYu_XueWei}
                onChange={(v) => setField('ZaiZhiJiaoYu_XueWei', v)}
              />
            </td>
            <td className={TD} colSpan={3}>
              <div className="grid grid-cols-2 gap-1">
                <TextInput
                  value={data.ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi}
                  onChange={(v) => setField('ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi', v)}
                />
                <TextInput
                  value={data.ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi}
                  onChange={(v) => setField('ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi', v)}
                />
              </div>
            </td>
          </tr>

          {/* ===== 现任/拟任/拟免职务 ===== */}
          <tr>
            <td className={TH}>现任职务</td>
            <td className={TD}>
              <TextInput
                value={data.XianRenZhiWu}
                onChange={(v) => setField('XianRenZhiWu', v)}
              />
            </td>
            <td className={TH}>拟任职务</td>
            <td className={TD}>
              <TextInput
                value={data.NiRenZhiWu}
                onChange={(v) => setField('NiRenZhiWu', v)}
              />
            </td>
            <td className={TH}>拟免职务</td>
            <td className={TD}>
              <TextInput
                value={data.NiMianZhiWu}
                onChange={(v) => setField('NiMianZhiWu', v)}
              />
            </td>
          </tr>

          {/* ===== 简历 ===== */}
          <tr>
            <td className={TH}>简历</td>
            <td className={TD} colSpan={6}>
              <TextArea value={data.JianLi} onChange={(v) => setField('JianLi', v)} rows={6} />
            </td>
          </tr>

          {/* ===== 奖惩情况 ===== */}
          <tr>
            <td className={TH}>奖惩情况</td>
            <td className={TD} colSpan={6}>
              <TextArea
                value={data.JiangChengQingKuang}
                onChange={(v) => setField('JiangChengQingKuang', v)}
                rows={2}
              />
            </td>
          </tr>

          {/* ===== 年度考核结果 ===== */}
          <tr>
            <td className={TH}>年度考核结果</td>
            <td className={TD} colSpan={6}>
              <TextArea
                value={data.NianDuKaoHeJieGuo}
                onChange={(v) => setField('NianDuKaoHeJieGuo', v)}
                rows={2}
              />
            </td>
          </tr>

          {/* ===== 任免理由 ===== */}
          <tr>
            <td className={TH}>任免理由</td>
            <td className={TD} colSpan={6}>
              <TextArea
                value={data.RenMianLiYou}
                onChange={(v) => setField('RenMianLiYou', v)}
                rows={2}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
