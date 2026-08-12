/**
 * 第 2 页 — 家庭成员 / 底部信息（身份证 / 呈报单位 / 日期 / 填表人）
 */

import { useArchiveStore } from '../store/archive'
import type { FamilyMember } from '../types/archive'
import { TextInput, TD, TH } from './FormFields'

export default function Page2(): React.JSX.Element {
  const data = useArchiveStore((s) => {
    const doc = s.activeId ? s.docs[s.activeId] : undefined
    return doc?.data
  })
  const setField = useArchiveStore((s) => s.setField)
  const addFamilyMember = useArchiveStore((s) => s.addFamilyMember)
  const removeFamilyMember = useArchiveStore((s) => s.removeFamilyMember)
  const updateFamilyMember = useArchiveStore((s) => s.updateFamilyMember)

  if (!data) return <div className="p-4 text-slate-400 text-sm">未打开档案</div>

  const family = data.JiaTingChengYuan.Item

  return (
    <div className="p-4 max-w-[210mm] mx-auto bg-stone-50">
      {/* ======= 家庭成员 ======= */}
      <div className="mb-1 font-bold text-sm">家庭成员及重要社会关系</div>
      <table className="border-collapse w-full border border-gray-400">
        <thead>
          <tr>
            <th className={TH + ' w-[12%]'}>称谓</th>
            <th className={TH + ' w-[12%]'}>姓名</th>
            <th className={TH + ' w-[12%]'}>出生日期</th>
            <th className={TH + ' w-[12%]'}>政治面貌</th>
            <th className={TH}>工作单位及职务</th>
            <th className={TH + ' w-[6%]'}>操作</th>
          </tr>
        </thead>
        <tbody>
          {family.map((member: FamilyMember, i: number) => (
            <tr key={i}>
              <td className={TD}>
                <TextInput
                  value={member.ChengWei}
                  onChange={(v) => updateFamilyMember(i, 'ChengWei', v)}
                />
              </td>
              <td className={TD}>
                <TextInput
                  value={member.XingMing}
                  onChange={(v) => updateFamilyMember(i, 'XingMing', v)}
                />
              </td>
              <td className={TD}>
                <TextInput
                  value={member.ChuShengRiQi}
                  onChange={(v) => updateFamilyMember(i, 'ChuShengRiQi', v)}
                />
              </td>
              <td className={TD}>
                <TextInput
                  value={member.ZhengZhiMianMao}
                  onChange={(v) => updateFamilyMember(i, 'ZhengZhiMianMao', v)}
                />
              </td>
              <td className={TD}>
                <TextInput
                  value={member.GongZuoDanWeiJiZhiWu}
                  onChange={(v) => updateFamilyMember(i, 'GongZuoDanWeiJiZhiWu', v)}
                />
              </td>
              <td className={TD + ' text-center'}>
                <button
                  className="text-red-500 text-xs hover:text-red-700 cursor-pointer"
                  onClick={() => removeFamilyMember(i)}
                >
                  删
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="mt-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
        onClick={addFamilyMember}
      >
        + 添加家庭成员
      </button>

      {/* ======= 底部信息 ======= */}
      <table className="border-collapse w-full border border-gray-400 mt-4">
        <tbody>
          <tr>
            <td className={TH + ' w-[12%]'}>身份证号</td>
            <td className={TD + ' w-[38%]'}>
              <TextInput value={data.ShenFenZheng} onChange={(v) => setField('ShenFenZheng', v)} />
            </td>
            <td className={TH + ' w-[12%]'}>呈报单位</td>
            <td className={TD + ' w-[38%]'}>
              <TextInput
                value={data.ChengBaoDanWei}
                onChange={(v) => setField('ChengBaoDanWei', v)}
              />
            </td>
          </tr>
          <tr>
            <td className={TH}>计算年龄时间</td>
            <td className={TD}>
              <TextInput
                value={data.JiSuanNianLingShiJian}
                onChange={(v) => setField('JiSuanNianLingShiJian', v)}
              />
            </td>
            <td className={TH}>填表时间</td>
            <td className={TD}>
              <TextInput
                value={data.TianBiaoShiJian}
                onChange={(v) => setField('TianBiaoShiJian', v)}
              />
            </td>
          </tr>
          <tr>
            <td className={TH}>填表人</td>
            <td className={TD} colSpan={3}>
              <TextInput value={data.TianBiaoRen} onChange={(v) => setField('TianBiaoRen', v)} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
