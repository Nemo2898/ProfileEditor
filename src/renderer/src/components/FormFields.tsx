/**
 * 共享表单控件 — 单行 / 多行文本输入
 */

export const TD = 'border border-gray-400 px-1 py-0.5 text-sm align-top'
export const TH = 'border border-gray-400 px-1 py-0.5 text-sm bg-gray-100 text-center font-normal'

export function TextInput({
  value,
  onChange
}: {
  value: string
  onChange: (v: string) => void
}): React.JSX.Element {
  return (
    <input
      type="text"
      className="w-full outline-none text-sm bg-transparent text-gray-900 caret-gray-900"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function TextArea({
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
      className="w-full outline-none text-sm bg-transparent text-gray-900 caret-gray-900 resize-none"
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
