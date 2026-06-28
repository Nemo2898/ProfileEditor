/**
 * 共享表单控件 — 自适应 textarea（内容到格边自动折行，行高随文本增长）
 */

import { useRef, useEffect, useCallback } from 'react'

export const TD = 'border border-gray-400 px-1 py-0.5 text-sm align-top'
export const TH = 'border border-gray-400 px-1 py-0.5 text-sm bg-gray-100 text-center font-normal'

/** alert 后焦点回到第一个输入框（姓名） */
export function focusNameField(): void {
  const el = document.querySelector('textarea') as HTMLTextAreaElement | null
  if (el) {
    el.focus()
    el.setSelectionRange(0, 0)
  }
}

/** 通用自适应高度 textarea：rows 为初始行数，内容超出自动撑高 */
export function TextInput({
  value,
  onChange,
  rows = 1
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}): React.JSX.Element {
  const ref = useRef<HTMLTextAreaElement>(null)

  const autoGrow = useCallback(() => {
    const el = ref.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = (el.scrollHeight + 1) + 'px'
    }
  }, [])

  useEffect(() => {
    autoGrow()
  }, [value, autoGrow])

  return (
    <textarea
      ref={ref}
      className="w-full outline-none text-sm bg-transparent text-gray-900 resize-none"
      style={{ caretColor: '#1f2937' }}
      rows={rows}
      value={value}
      onChange={(e) => { onChange(e.target.value); autoGrow() }}
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
  return <TextInput value={value} onChange={onChange} rows={rows} />
}
