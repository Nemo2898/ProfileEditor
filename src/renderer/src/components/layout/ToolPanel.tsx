/**
 * ToolPanel — 右侧工具栏（双列）
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
      className="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
      title={label}
    >
      {icon}
      <span className="text-[10px] leading-none text-center">{label}</span>
    </button>
  )
}

export default function ToolPanel(): React.JSX.Element {
  return (
    <div className="flex flex-col bg-slate-900 border-l border-slate-700 px-2 py-4 h-full w-[128px] shrink-0">
      {/* 工具栏：双列网格 */}
      <div className="grid grid-cols-2 gap-1">
        <ToolButton icon={<Save size={20} />} label="保存" />
        <ToolButton icon={<FileOutput size={20} />} label="导出PDF" />
        <ToolButton icon={<Printer size={20} />} label="打印" />
        <ToolButton icon={<Settings size={20} />} label="设置" />
      </div>

      {/* 分隔 */}
      <div className="w-full h-px bg-slate-700 my-3" />

      {/* 预留空间：后续填充 */}
      <div className="flex-1" />
      <div className="text-[10px] text-slate-600 text-center mt-2">v1.0</div>
    </div>
  )
}
