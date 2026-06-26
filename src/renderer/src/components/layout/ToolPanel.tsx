/**
 * ToolPanel — 右侧工具栏
 */

import { Save, FileOutput, Printer, Settings } from 'lucide-react'
import type { ReactNode } from 'react'

interface ToolButtonProps {
  icon: ReactNode
  label: string
  onClick?: () => void
}

function ToolButton({ icon, label, onClick }: ToolButtonProps): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer w-full"
      title={label}
    >
      {icon}
      <span className="text-[10px] leading-none">{label}</span>
    </button>
  )
}

export default function ToolPanel(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center bg-slate-900 border-l border-slate-700 px-2 py-4 gap-1 h-full w-[72px]">
      <ToolButton icon={<Save size={20} />} label="保存" />
      <ToolButton icon={<FileOutput size={20} />} label="导出 PDF" />
      <ToolButton icon={<Printer size={20} />} label="打印" />

      {/* 分隔 */}
      <div className="w-8 h-px bg-slate-700 my-2" />

      <ToolButton icon={<Settings size={20} />} label="设置" />

      {/* 预留空间：后续填充 */}
      <div className="flex-1" />
      <div className="text-[10px] text-slate-600 mt-2">v1.0</div>
    </div>
  )
}
