/**
 * 固定版式编辑表单 — 干部任免审批表
 * 数据绑定 Zustand store，字段位置与标准表格一致
 */

import { useArchiveStore, FIELD_LABELS } from '../store/archive'
import type { FamilyMember } from '../types/archive'

/* Tailwind class shortcuts for table cells */
const TD = 'border border-gray-400 px-1 py-0.5 text-sm align-top'
const TH = 'border border-gray-400 px-1 py-0.5 text-sm bg-gray-100 text-center font-normal'

/** 单行文本输入包装 */
function TextInput({
  value,
  onChange
}: {
  value: string
  onChange: (v: string) => void
}): React.JSX.Element {
  return (
    <input
      type="text"
      className="w-full outline-none text-sm bg-transparent"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

/** 多行文本输入 */
function TextArea({
  value,
  onChange,
  rows = 4
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}): React.JSX.Element {
  return (
    <textarea
      className="w-full outline-none text-sm bg-transparent resize-none"
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export default function Editor(): React.JSX.Element {
  const data = useArchiveStore((s) => s.data)
  const setField = useArchiveStore((s) => s.setField)
  const addFamilyMember = useArchiveStore((s) => s.addFamilyMember)
  const removeFamilyMember = useArchiveStore((s) => s.removeFamilyMember)
  const updateFamilyMember = useArchiveStore((s) => s.updateFamilyMember)

  const family = data.JiaTingChengYuan.Item

  return (
    <div className="p-4 max-w-[210mm] mx-auto bg-white">
      {/* ======= 标题 ======= */}
      <div className="text-center text-lg font-bold mb-2">干部任免审批表</div>

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
            <td className="border border-gray-400 text-center text-xs text-gray-400" rowSpan={5}>
              照片
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

      {/* ======= 家庭成员 ======= */}
      <div className="mt-3 mb-1 font-bold text-sm">家庭成员及重要社会关系</div>
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
                  className="text-red-500 text-xs hover:text-red-700"
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
        className="mt-1 text-xs text-blue-600 hover:text-blue-800"
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
              <TextInput
                value={data.ShenFenZheng}
                onChange={(v) => setField('ShenFenZheng', v)}
              />
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
              <TextInput
                value={data.TianBiaoRen}
                onChange={(v) => setField('TianBiaoRen', v)}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
